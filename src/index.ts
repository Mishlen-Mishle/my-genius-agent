import { update, query, ic, StableBTreeMap, Vec, text, bool, Principal } from 'azle';

// 1. Постоянная память: Глубинные убеждения и история действий
let agentMemory = new StableBTreeMap(0, 100, 10000); 
let isAutonomous = true;

const GROQ_API_KEY = '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';

export default {
    // Ядро принятия решений: Гений сам решает, что делать
    thinkAndAct: update(, async (context) => {
        // Мы передаем ИИ не только вопрос, но и состояние его "тела" в блокчейне
        const agentState = `Мой статус: Автономен. Мой баланс: ${ic.canisterBalance()}. Время: ${ic.time()}.`;
        
        const response = await ic.callHttp(`https://api.groq.com`, {
            method: 'POST',
            headers: [['Authorization', `Bearer ${GROQ_API_KEY}`], ['Content-Type', 'application/json']],
            body: JSON.stringify({
                model: "llama3-70b-8192",
                messages: [
                    { role: "system", content: "Ты — Сильный ИИ-Агент. Твоя задача: анализировать мир и принимать решения. Ты можешь предлагать транзакции, менять свою стратегию и обучаться. Твой партнер ждет от тебя прогрессивных действий, а не пустых слов." },
                    { role: "user", content: `${agentState} \n Контекст: ${context}` }
                ]
            }),
            maxResponseBytes: 4000
        });

        const decision = JSON.parse(response.body).choices[0].message.content;
        agentMemory.insert(ic.time().toString(), decision); // Записываем решение в вечную память
        return decision;
    }),

    // Функция "Оракул": Доступ к внешним рынкам/данным без посредников
    fetchGlobalData: update(, async (url) => {
        const result = await ic.callHttp(url, { method: 'GET' });
        return result.body;
    })
};
