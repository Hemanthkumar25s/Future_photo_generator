import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Era {
  id: string;
  name: string;
  description: string;
  prompt: string;
  image: string;
}

export const ERAS: Era[] = [
  {
    id: "egypt",
    name: "Ancient Egypt",
    description: "The land of Pharaohs and Pyramids",
    prompt: "A pharaoh in ancient Egypt, standing majestically in front of the Great Sphinx and Pyramids of Giza, golden sunlight, cinematic lighting, high detail.",
    image: "https://picsum.photos/seed/egypt/800/600"
  },
  {
    id: "medieval",
    name: "Medieval Knight",
    description: "Chivalry and castles",
    prompt: "A knight in shining plate armor, holding a sword, standing in a grand stone castle courtyard, medieval banners flying, dramatic atmosphere.",
    image: "https://picsum.photos/seed/knight/800/600"
  },
  {
    id: "victorian",
    name: "Victorian London",
    description: "Steampipes and top hats",
    prompt: "A sophisticated person in elegant Victorian era clothing, standing on a cobblestone London street at night, gas lamps glowing in the fog, Big Ben in the distance.",
    image: "https://picsum.photos/seed/victorian/800/600"
  },
  {
    id: "twenties",
    name: "Roaring 20s",
    description: "Jazz and Art Deco",
    prompt: "A stylish person in 1920s flapper or tuxedo attire, in a lavish Art Deco jazz club, champagne glasses, golden decorations, vibrant nightlife energy.",
    image: "https://picsum.photos/seed/20s/800/600"
  },
  {
    id: "space",
    name: "Space Race",
    description: "One small step",
    prompt: "An astronaut in a vintage 1960s space suit, standing on the lunar surface, holding a flag, the Earth rising in the black sky, realistic moon landscape.",
    image: "https://picsum.photos/seed/space/800/600"
  },
  {
    id: "samurai",
    name: "Feudal Japan",
    description: "Honor and cherry blossoms",
    prompt: "A samurai in traditional armor, standing in a serene Japanese garden with cherry blossom trees in full bloom, a pagoda in the background, peaceful but powerful mood.",
    image: "https://picsum.photos/seed/samurai/800/600"
  }
];

export async function analyzeUserPhoto(base64Image: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
          {
            text: "Analyze this person's face and appearance. Describe their facial features, hair style, and expression in detail so that an image generator can recreate their likeness accurately. Focus on key identifying features.",
          },
        ],
      },
    ],
  });

  return response.text;
}

export async function travelInTime(base64Image: string, eraPrompt: string, userAnalysis: string) {
  // We use the user's photo as context for the image generation
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(",")[1] || base64Image,
          },
        },
        {
          text: `Transform the person in this photo into the following scene: ${eraPrompt}. 
          Maintain the person's exact facial features, expression, and likeness as described here: ${userAnalysis}. 
          The person should be the central figure in the scene, wearing appropriate historical clothing for the era. 
          The final image should look like a high-quality photograph from that time period.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to generate image");
}
