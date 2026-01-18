
import { GoogleGenAI } from "@google/genai";

// API Initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Selectors
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatModeBtn = document.getElementById('chat-mode-btn');
const imageModeBtn = document.getElementById('image-mode-btn');

// State
let currentMode = 'chat'; // 'chat' or 'image'
let chatHistory = [];

// Initialize
function init() {
    addMessage('ai', 'नमस्ते! मैं **योगेश एआई** हूँ। मैं आपके हर सवाल का जवाब दे सकता हूँ और शानदार 3D फोटो भी बना सकता हूँ। बताइए, आज क्या सेवा करूँ?');
    
    // Listeners
    sendBtn.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    chatModeBtn.addEventListener('click', () => setMode('chat'));
    imageModeBtn.addEventListener('click', () => setMode('image'));
}

function setMode(mode) {
    currentMode = mode;
    if (mode === 'chat') {
        chatModeBtn.className = 'px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-sky-600 text-white shadow-lg';
        imageModeBtn.className = 'px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-gray-500 hover:text-white';
        userInput.placeholder = "योगेश से पूछें...";
    } else {
        imageModeBtn.className = 'px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-purple-600 text-white shadow-lg';
        chatModeBtn.className = 'px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-gray-500 hover:text-white';
        userInput.placeholder = "3D इमेज का विषय लिखें (उदा: Flying Robot)...";
    }
}

async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    userInput.value = '';
    addMessage('user', text);
    
    // Show loading
    const loadingId = addLoading();

    try {
        if (currentMode === 'image') {
            const imageUrl = await generateImage(text);
            removeLoading(loadingId);
            addImageMessage(imageUrl, text);
        } else {
            const response = await getChatResponse(text);
            removeLoading(loadingId);
            addMessage('ai', response);
        }
    } catch (error) {
        removeLoading(loadingId);
        addMessage('ai', 'माफ कीजिये, मुझे आपकी बात समझने में थोड़ी मुश्किल हो रही है। कृपया फिर से कोशिश करें।');
    }
}

async function getChatResponse(prompt) {
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
                { role: 'user', parts: [{ text: "System Instruction: You are Yogesh AI, a world-class assistant created by Founder Yogesh. You speak in Hinglish (mix of Hindi and English). You are witty, super smart and helpful. Format your responses with markdown if needed." }] },
                ...chatHistory,
                { role: 'user', parts: [{ text: prompt }] }
            ]
        });
        
        const responseText = result.text;
        chatHistory.push({ role: 'user', parts: [{ text: prompt }] });
        chatHistory.push({ role: 'model', parts: [{ text: responseText }] });
        
        return responseText;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function generateImage(prompt) {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: `High quality 3D render, cinematic, unreal engine 5, masterpiece, detailed: ${prompt}` }]
            },
            config: {
                imageConfig: { aspectRatio: "1:1" }
            }
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        throw new Error("No image generated");
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// UI Helpers
function addMessage(sender, text) {
    const div = document.createElement('div');
    div.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} message`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    div.innerHTML = `
        <div class="flex gap-4 max-w-[85%] ${sender === 'user' ? 'flex-row-reverse' : ''}">
            <div class="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border-2 ${sender === 'user' ? 'bg-slate-800 border-sky-400/30' : 'bg-sky-600 border-white/20'}">
                ${sender === 'user' ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>'}
            </div>
            <div class="p-5 rounded-3xl ${sender === 'user' ? 'bg-sky-600 text-white rounded-tr-none' : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none backdrop-blur-xl'}">
                <div class="text-sm md:text-base leading-relaxed whitespace-pre-wrap">${formatMarkdown(text)}</div>
                <div class="text-[9px] mt-3 font-black uppercase tracking-widest opacity-30 ${sender === 'user' ? 'text-right' : 'text-left'}">${time}</div>
            </div>
        </div>
    `;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addImageMessage(url, prompt) {
    const div = document.createElement('div');
    div.className = "flex justify-start message";
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    div.innerHTML = `
        <div class="flex gap-4 max-w-[85%]">
            <div class="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-purple-600 border border-white/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            </div>
            <div class="p-5 rounded-3xl bg-white/5 text-gray-200 border border-white/10 rounded-tl-none backdrop-blur-xl">
                <p class="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-4 italic">3D Generation: "${prompt}"</p>
                <img src="${url}" class="rounded-2xl border-4 border-white/5 shadow-2xl w-full max-w-sm" alt="AI Generated">
                <div class="text-[9px] mt-4 font-black uppercase tracking-widest opacity-20">${time}</div>
            </div>
        </div>
    `;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addLoading() {
    const id = 'loading-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = "flex justify-start message";
    div.innerHTML = `
        <div class="flex gap-4 items-center p-4 glass rounded-3xl border border-sky-500/20">
            <div class="loading-dots">
                <span></span><span></span><span></span>
            </div>
            <span class="text-[10px] font-black tracking-widest text-sky-500 uppercase">योगेश सोच रहा है...</span>
        </div>
    `;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}

function removeLoading(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function formatMarkdown(text) {
    // Basic Markdown support (Bold and Code)
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-sky-400">$1</strong>')
        .replace(/`(.*?)`/g, '<code class="bg-black/50 px-1.5 py-0.5 rounded text-sky-300 font-mono text-sm">$1</code>')
        .replace(/```([\s\S]*?)```/g, '<pre class="bg-black/80 p-4 rounded-xl my-4 text-sky-400 font-mono text-xs overflow-x-auto border border-sky-500/20">$1</pre>');
}

// Start
init();
