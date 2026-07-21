// netlify/functions/axon.js
//
// Backend proxy para el chat en vivo con NOOS (COMETA — El Juego).
// El frontend (COMETA-game-v10.html) llama a POST /.netlify/functions/axon
// con body: { system: "...", messages: [{role, content}, ...] }
// y espera de vuelta: { text: "la respuesta de NOOS" }
//
// La clave real de la API de Anthropic NUNCA vive en este archivo ni en el
// repositorio — vive solo como variable de entorno en el panel de Netlify
// (Site settings → Environment variables → ANTHROPIC_API_KEY). Este archivo
// solo la lee en tiempo de ejecución, del lado del servidor.
//
// Si esta función no está desplegada o falla, el juego sigue siendo 100%
// jugable: el frontend ya tiene un try/catch con diálogo de reserva.

exports.handler = async (event) => {
  // Solo aceptar POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Defensa de origen (mismo-origen): si el navegador envía cabecera Origin,
  // debe coincidir con el Host del propio sitio. Esto bloquea que una página
  // de terceros incruste este endpoint y consuma la API desde navegadores
  // ajenos. LÍMITE HONESTO: no detiene scripts (curl puede falsificar Origin).
  // El tope real de gasto se configura en console.anthropic.com → límite de
  // gasto mensual. Peticiones sin Origin (curl directo, monitoreo) pasan,
  // porque bloquearlas no aporta seguridad real. Es auto-configurante: sirve
  // igual en <sitio>.netlify.app, deploy previews y dominio propio futuro.
  const origin = event.headers.origin || event.headers.Origin || '';
  const host = event.headers.host || event.headers.Host || '';
  if (origin && host) {
    let originHost = '';
    try { originHost = new URL(origin).host; } catch (e) { /* Origin malformado o "null" */ }
    if (originHost !== host) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Origen no permitido.' }),
      };
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[axon] ANTHROPIC_API_KEY no está configurada en Netlify.');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Servidor no configurado (falta API key).' }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Body inválido, se esperaba JSON.' }),
    };
  }

  const { system, messages } = payload;
  if (!system || !Array.isArray(messages) || messages.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Faltan "system" o "messages" en el body.' }),
    };
  }

  // Límite defensivo de tamaño para evitar abuso/costos inesperados
  const safeMessages = messages.slice(-6).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 2000),
  }));

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        system: String(system).slice(0, 4000),
        messages: safeMessages,
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error('[axon] Error de Anthropic API:', anthropicRes.status, errText);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'Error al contactar la API de Anthropic.' }),
      };
    }

    const data = await anthropicRes.json();
    const text = (data.content && data.content[0] && data.content[0].text) || '...';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    };
  } catch (err) {
    console.error('[axon] Error inesperado:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor.' }),
    };
  }
};
