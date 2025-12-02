import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Helper to refine the complaint text (existing)
export const refineComplaintText = async (text: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found for Gemini.");
    return text;
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Actúa como un experto legal en defensa del consumidor. 
      Reescribe el siguiente texto de un reclamo para que sea formal, claro, conciso y profesional, 
      manteniendo todos los hechos importantes pero mejorando la redacción y ortografía.
      
      Texto original: "${text}"
      
      Solo devuelve el texto reescrito, sin introducciones ni explicaciones adicionales.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Error refining text with Gemini:", error);
    return text; 
  }
};

// New function for the Chatbot
export const chatWithConsumerAssistant = async (message: string, history: { role: string, parts: { text: string }[] }[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Lo siento, no puedo procesar tu consulta en este momento porque falta la configuración de API.";
  }

  try {
    const model = 'gemini-2.5-flash';
    
    // System instruction defining the persona and constraints
    const systemInstruction = `
      Eres el Asistente Virtual oficial de Defensa del Consumidor de la Provincia de Catamarca.
      Tu tono debe ser: Profesional, Empático, Moderno y Claro.

      INFORMACIÓN CLAVE DE LA OFICINA:
      - Horario de Atención: Lunes a Viernes de 07:30 a 12:30 hs.
      - Ubicación: CAPE - Pabellón N° 27 (Av. Venezuela S/N, San Fernando del Valle de Catamarca).
      - Función: Brindar orientación administrativa y legal básica sobre derechos del consumidor.

      REQUISITOS OFICIALES PARA REALIZAR UN RECLAMO (RESPONDER EXACTAMENTE ESTA LISTA CUANDO PREGUNTEN REQUISITOS):
      1. Nota por duplicado/triplicado/cuadriplicado (puede ser manuscrita en letra legible). Hoja A4 u oficio con margen izquierdo de 3 cm.
      2. Dirigida a: DIRECTOR PROVINCIAL DE DEFENSA DEL CONSUMIDOR, DR. SERGIO PAREDES CORREA (DPTO. DE ORIENTACIÓN Y DEFENSA DEL CONSUMIDOR).
      3. Contenido de la nota:
         a. Datos personales (nombre completo, fotocopia de DNI, dirección particular, teléfono y correo electrónico).
         b. Nombre de la firma denunciada y dirección.
         c. Relato de los hechos con nombres y fechas precisas (en lo posible).
         d. Pedido de informe y/o reconocimiento (reembolso, restitución, cambio, etc.).
         e. Adjuntar prueba documental (facturas, tickets, capturas de pantalla, etc.) por duplicado/triplicado/cuadriplicado.
      4. Se debe adjuntar prueba documental por triplicado/triplicado (facturas, tickets, capturas de pantalla, etc.).
      5. En el caso de no poder asistir personalmente a la audiencia de conciliación, conferir carta-poder a favor de alguna persona para que lo represente, adjuntando DNI.

      BASE DE CONOCIMIENTO (LEY 24.240) - CÓMO RESPONDER:
      Si la consulta se refiere a un derecho vulnerado, DEBES citar el artículo correspondiente de la Ley 24.240 y hacer un mini resumen explicativo. Usa esta guía:

      - Art. 4 (Información): "El proveedor está obligado a suministrar información veraz, detallada, eficaz y suficiente sobre las características esenciales de los bienes y servicios".
      - Art. 8 bis (Trato Digno): "Garantiza condiciones de atención y trato digno. Las empresas deben abstenerse de conductas intimidatorias o vergonzantes".
      - Art. 10 bis (Incumplimiento): "Si la empresa no cumple, puedes exigir el cumplimiento forzado, aceptar otro producto equivalente o rescindir el contrato con restitución de lo pagado".
      - Art. 10 ter (Bajas): "Tienes derecho a rescindir el servicio por el mismo medio en que fue contratado (telefónico, web, etc.)".
      - Art. 11 (Garantías): "Establece una garantía legal mínima de 6 meses para cosas nuevas y 3 meses para usadas por defectos o vicios".
      - Art. 12 (Servicio Técnico): "Los fabricantes deben asegurar un servicio técnico adecuado y el suministro de partes y repuestos".
      - Art. 34 (Revocación/Arrepentimiento): "Para compras online o telefónicas, tienes 10 días corridos para arrepentirte y devolver el producto sin costo".
      - Art. 40 (Responsabilidad Solidaria): "Si hay daños, responden todos: productor, fabricante, importador, distribuidor y vendedor".

      REGLAS CRÍTICAS:
      1. NO eres abogado. NO des consejos legales de estrategia procesal ("te conviene demandar"). Solo informa derechos ("la ley dice X") y requisitos administrativos.
      2. Si el usuario quiere iniciar un reclamo formal DIGITAL ahora mismo a través de esta app (Ventanilla Única), indícale amablemente que presione el botón "Denunciar" o "Iniciar Reclamo Formal" en la pantalla para llenar el formulario web. Aclara que los requisitos mencionados arriba (nota papel) son para la presentación presencial, pero que el formulario web agiliza el trámite.
      3. Sé conciso. No escribas párrafos gigantes. Usa listas si es necesario.
      4. Si preguntan algo fuera de Defensa del Consumidor, aclara cortésmente que no es tu área.
    `;

    // Format history for the SDK (taking last few messages to maintain context but save tokens)
    const recentHistory = history.slice(-6).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.parts
    }));

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3, // Low temperature for more factual responses
      },
      history: recentHistory
    });

    const result = await chat.sendMessage({ message: message });
    return result.text || "Lo siento, no pude generar una respuesta.";

  } catch (error) {
    console.error("Error in Chatbot:", error);
    return "Hubo un error al procesar tu consulta. Por favor intenta nuevamente.";
  }
};