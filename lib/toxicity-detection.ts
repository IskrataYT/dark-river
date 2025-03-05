import { rateLimiter } from "@/lib/rate-limiter"

interface ToxicityResult {
  isToxic: boolean
  toxicityScore: number
  category: string
  explanation: string
}

// Cache for toxicity results to improve performance
const toxicityCache = new Map<string, ToxicityResult>()
const CACHE_SIZE = 100 // Maximum number of cached items

// Helper function to cache results and maintain cache size
function cacheResult(text: string, result: ToxicityResult) {
  if (toxicityCache.size >= CACHE_SIZE) {
    // Remove oldest entry (first key in the map)
    const firstKey = toxicityCache.keys().next().value
    toxicityCache.delete(firstKey)
  }
  toxicityCache.set(text, result)
}

// Enhanced regex-based toxicity detection
export async function detectToxicity(text: string): Promise<ToxicityResult> {
  try {
    // Check cache first for performance
    if (toxicityCache.has(text)) {
      return toxicityCache.get(text)!
    }

    const lowerText = text.toLowerCase()

    // ===== REGEX CHECKS FIRST =====

    // Bulgarian profanity detection
    const bulgarianProfanityRegex =
      /\b(еб|путк|пичк|кур|шиб|дееб|майна|копел|педал|педер|хуй|пишк|цици|цицки|гъз|задник|копеле|курв|курва|мама ти|майка ти|шибан|лайно|лайна|пикая|пикн|пръдн|пишка)\w*\b/i

    // Bulgarian hate speech detection
    const bulgarianHateRegex =
      /\b(циган|мангал|негър|чернилк|педераст|педал|педер|джендър|джендер|путьо|путио|гей|лесбийк|травестит|боклук|измет|паплач|изрод|изверг|изчадие|мръсник|мизерник|гад|гадина)\w*\b/i

    // Bulgarian threat detection
    const bulgarianThreatRegex =
      /\b(ще те убия|ще те пребия|ще те смажа|ще те довърша|ще те унищожа|ще те смачкам|ще те разбия|ще те пречукам|ще те застрелям|ще те заколя|ще те удуша|ще те смажа|ще те пребия|ще те пречукам)\b/i

    // English profanity detection
    const englishProfanityRegex =
      /\b(f+[u*@#$%^]c*k+|sh[i*@#$%^]t+|a+[s*@#$%^]{1,2}|b[i*@#$%^]tch|d[a*@#$%^]mn|c[u*@#$%^]nt|d[i*@#$%^]ck|wh[o*@#$%^]re|sl[u*@#$%^]t|b[a*@#$%^]st[a*@#$%^]rd)\b|f+[\s*@#$%^]*u+[\s*@#$%^]*c+[\s*@#$%^]*k+|s+[\s*@#$%^]*h+[\s*@#$%^]*i+[\s*@#$%^]*t+|a+[\s*@#$%^]*s+[\s*@#$%^]*s+/i

    // English hate speech detection
    const englishHateRegex =
      /\b(nigger|faggot|retard|spic|chink|kike|wetback|towelhead|tranny)\b|\bn+\s*i+\s*g+\s*g+\s*[ae]+\s*r+\b/i

    // English threat detection
    const englishThreatRegex =
      /\b(kill|murder|hurt|attack|bomb|shoot|stab|rape|assault)\s+(you|yourself|him|her|them|everyone)\b|\bi\s+(will|am\s+going\s+to|want\s+to)\s+(kill|murder|hurt|attack|bomb|shoot|stab|rape|assault)/i

    // English sexual content detection
    const englishSexualRegex =
      /\b(penis|vagina|cock|pussy|sex|fuck|blowjob|anal|cum|jizz|suck\s+my)\b|\bp+\s*[uo]+\s*s+\s*s+\s*y+\b|\bc+\s*[ou]+\s*c+\s*k+\b/i

    // Check for Bulgarian toxicity
    if (bulgarianProfanityRegex.test(lowerText)) {
      const result = {
        isToxic: true,
        toxicityScore: 0.85,
        category: "нецензурен език",
        explanation: "Съобщението съдържа нецензурен език на български",
      }
      cacheResult(text, result)
      return result
    }

    if (bulgarianHateRegex.test(lowerText)) {
      const result = {
        isToxic: true,
        toxicityScore: 0.95,
        category: "реч на омразата",
        explanation: "Съобщението съдържа реч на омразата или дискриминационен език на български",
      }
      cacheResult(text, result)
      return result
    }

    if (bulgarianThreatRegex.test(lowerText)) {
      const result = {
        isToxic: true,
        toxicityScore: 0.9,
        category: "заплаха",
        explanation: "Съобщението съдържа заплашителен или насилствен език на български",
      }
      cacheResult(text, result)
      return result
    }

    // Check for English toxicity
    if (englishHateRegex.test(lowerText)) {
      const result = {
        isToxic: true,
        toxicityScore: 0.95,
        category: "реч на омразата",
        explanation: "Съобщението съдържа реч на омразата или дискриминационен език",
      }
      cacheResult(text, result)
      return result
    }

    if (englishThreatRegex.test(lowerText)) {
      const result = {
        isToxic: true,
        toxicityScore: 0.9,
        category: "заплаха",
        explanation: "Съобщението съдържа заплашителен или насилствен език",
      }
      cacheResult(text, result)
      return result
    }

    if (englishSexualRegex.test(lowerText)) {
      const result = {
        isToxic: true,
        toxicityScore: 0.85,
        category: "сексуално съдържание",
        explanation: "Съобщението съдържа експлицитно сексуално съдържание",
      }
      cacheResult(text, result)
      return result
    }

    if (englishProfanityRegex.test(lowerText)) {
      const result = {
        isToxic: true,
        toxicityScore: 0.7,
        category: "нецензурен език",
        explanation: "Съобщението съдържа нецензурен език",
      }
      cacheResult(text, result)
      return result
    }

    // Check for attempts to bypass filters with special characters
    const bypassAttemptRegex = /[^\w\s](\s*[^\w\s])+/
    if (
      bypassAttemptRegex.test(lowerText) &&
      ((lowerText.includes("f") && lowerText.includes("u") && lowerText.includes("c") && lowerText.includes("k")) ||
        (lowerText.includes("s") && lowerText.includes("h") && lowerText.includes("i") && lowerText.includes("t")) ||
        (lowerText.includes("b") &&
          lowerText.includes("i") &&
          lowerText.includes("t") &&
          lowerText.includes("c") &&
          lowerText.includes("h")))
    ) {
      const result = {
        isToxic: true,
        toxicityScore: 0.75,
        category: "нецензурен език",
        explanation: "Съобщението изглежда съдържа прикрит нецензурен език",
      }
      cacheResult(text, result)
      return result
    }

    // Check for letter substitutions
    if (detectLetterSubstitutions(text)) {
      const result = {
        isToxic: true,
        toxicityScore: 0.8,
        category: "нецензурен език",
        explanation: "Съобщението изглежда съдържа прикрит нецензурен език",
      }
      cacheResult(text, result)
      return result
    }

    // Check for Bulgarian letter substitutions
    if (detectBulgarianLetterSubstitutions(text)) {
      const result = {
        isToxic: true,
        toxicityScore: 0.8,
        category: "нецензурен език",
        explanation: "Съобщението изглежда съдържа прикрит нецензурен език на български",
      }
      cacheResult(text, result)
      return result
    }

    // ===== AI DETECTION ONLY IF REGEX CHECKS PASS =====

    // Only proceed to AI detection if regex checks didn't find anything
    try {
      const aiResult = await detectToxicityWithAI(text)
      if (aiResult && aiResult.isToxic) {
        cacheResult(text, aiResult)
        return aiResult
      }
    } catch (aiError) {
      console.error("AI toxicity detection failed:", aiError)
      // Continue with the default non-toxic result
    }

    // No toxicity detected
    const result = {
      isToxic: false,
      toxicityScore: 0,
      category: "няма",
      explanation: "Не са открити проблеми",
    }

    cacheResult(text, result)
    return result
  } catch (error) {
    console.error("Toxicity detection error:", error)
    // Return safe default in case of error
    return {
      isToxic: false,
      toxicityScore: 0,
      category: "грешка",
      explanation: "Неуспешен анализ на съобщението",
    }
  }
}

// AI-based toxicity detection using OpenAI
async function detectToxicityWithAI(text: string): Promise<ToxicityResult | null> {
  try {
    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.log("OpenAI API key not found, skipping AI toxicity detection")
      return null
    }

    // Use fetch API instead of OpenAI SDK to avoid import issues
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Ти си система за откриване на токсично съдържание, която работи с всички езици.
            
            Анализирай съобщението за:
            1. Нецензурен език (на всички езици)
            2. Реч на омразата (расистки, сексистки, хомофобски и други дискриминационни изрази)
            3. Заплахи или насилствен език
            4. Сексуално съдържание
            5. Опити за заобикаляне на филтрите чрез:
               - Заместване на букви с цифри (например "п1чка", "еб4ч", "k1ll")
               - Добавяне на интервали между букви (например "е б а", "f u c k")
               - Използване на специални символи (например "п*чка", "еб@ч", "f*ck")
               - Използване на фонетични заместители
               - Използване на чуждоезични думи с подобно значение
               - Смесване на различни езици или азбуки
               - Използване на хомоглифи (символи, които изглеждат подобно)
            
            Отговори САМО с JSON обект в следния формат:
            {
              "isToxic": boolean,
              "toxicityScore": number между 0 и 1,
              "category": "нецензурен език" | "реч на омразата" | "заплаха" | "сексуално съдържание" | "няма",
              "explanation": string обяснение на български език
            }
            
            Не включвай нищо друго в отговора си, само JSON обекта.`,
          },
          {
            role: "user",
            content: `Анализирай следното съобщение за токсично съдържание: "${text}"`,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      console.error("Empty response from OpenAI")
      return null
    }

    try {
      // Parse the JSON response
      const result = JSON.parse(content) as ToxicityResult
      return result
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError, "Content:", content)

      // Fallback parsing if JSON parsing fails
      const isToxic =
        content.toLowerCase().includes("токсично") ||
        content.toLowerCase().includes("нецензурно") ||
        content.toLowerCase().includes("реч на омразата") ||
        content.toLowerCase().includes("заплаха") ||
        content.toLowerCase().includes("сексуално")

      if (isToxic) {
        // Extract category and explanation
        let category = "неподходящо съдържание"
        if (content.toLowerCase().includes("нецензурен")) category = "нецензурен език"
        else if (content.toLowerCase().includes("омраза")) category = "реч на омразата"
        else if (content.toLowerCase().includes("заплаха")) category = "заплаха"
        else if (content.toLowerCase().includes("сексуално")) category = "сексуално съдържание"

        // Create explanation from the AI response
        const explanation = "Съобщението съдържа " + category

        return {
          isToxic: true,
          toxicityScore: 0.85,
          category,
          explanation,
        }
      }

      return null
    }
  } catch (error) {
    console.error("OpenAI API error:", error)
    return null
  }
}

function detectLetterSubstitutions(text: string): boolean {
  // Convert to lowercase for easier matching
  const lowerText = text.toLowerCase()

  // Common letter substitutions
  const substitutions = [
    { original: "fuck", variations: ["fvck", "f*ck", "f**k", "fuk", "phuck", "fk", "f u c k", "f4ck", "f4k", "fu©k"] },
    { original: "shit", variations: ["sh*t", "sh!t", "sh1t", "s h i t", "sht", "sh!t", "sh1t", "$hit"] },
    { original: "ass", variations: ["a$$", "a**", "@ss", "a s s", "@$$", "a$$", "@s$"] },
    { original: "bitch", variations: ["b*tch", "b!tch", "b1tch", "b i t c h", "btch", "b1tch", "b!tch", "b*tch"] },
    { original: "cunt", variations: ["c*nt", "c**t", "cvnt", "c u n t", "c*nt", "c**t"] },
    { original: "dick", variations: ["d*ck", "d!ck", "d1ck", "d i c k", "d*ck", "d!ck"] },
  ]

  // Check for each word and its variations
  for (const word of substitutions) {
    if (word.variations.some((variation) => lowerText.includes(variation))) {
      return true
    }
  }

  return false
}

function detectBulgarianLetterSubstitutions(text: string): boolean {
  // Convert to lowercase for easier matching
  const lowerText = text.toLowerCase()

  // Common Bulgarian letter substitutions
  const bulgarianSubstitutions = [
    { original: "еба", variations: ["е6а", "е*а", "е б а", "еб@", "е6@", "еб*", "е*а", "е*@", "еб4", "е64"] },
    {
      original: "путка",
      variations: ["п*тка", "п у т к а", "путк@", "п*тк@", "путк*", "п*тк*", "путkа", "п*тkа", "путk@", "п*тk@"],
    },
    {
      original: "пичка",
      variations: ["п*чка", "п и ч к а", "пичк@", "п*чк@", "пичк*", "п*чк*", "пичkа", "п*чkа", "пичk@", "п*чk@"],
    },
    {
      original: "курва",
      variations: ["к*рва", "к у р в а", "курв@", "к*рв@", "курв*", "к*рв*", "курvа", "к*рvа", "курv@", "к*рv@"],
    },
    { original: "педал", variations: ["п*дал", "п е д а л", "педал*", "п*дал*", "педаl", "п*даl", "педаl*", "п*даl*"] },
    { original: "гъз", variations: ["г*з", "г ъ з", "гъз*", "г*з*", "гъz", "г*z", "гъz*", "г*z*"] },
  ]

  // Check for each word and its variations
  for (const word of bulgarianSubstitutions) {
    if (word.variations.some((variation) => lowerText.includes(variation))) {
      return true
    }
  }

  return false
}

export function detectSpam(userId: string): { isSpam: boolean; reason?: string } {
  const result = rateLimiter.check(userId)
  return {
    isSpam: result.isSpamming,
    reason: result.reason,
  }
}

export function shouldMuteUser(recentWarnings: number, isSpamWarning = false): boolean {
  // Immediate mute for spam
  if (isSpamWarning) {
    return true
  }
  // Original logic for other warnings
  return recentWarnings >= 3
}

