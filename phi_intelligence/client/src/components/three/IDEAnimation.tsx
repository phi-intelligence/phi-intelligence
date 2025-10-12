import React, { useEffect, useRef, useState } from 'react';

interface IDEAnimationProps {
  className?: string;
  enableInteraction?: boolean;
}

export default function IDEAnimation({ className = "", enableInteraction = false }: IDEAnimationProps) {
  const [currentCode, setCurrentCode] = useState('');
  const [currentLine, setCurrentLine] = useState(1);
  const [currentCol, setCurrentCol] = useState(1);
  const [isTyping, setIsTyping] = useState(false);

  const codeSnippets = [
    `// Phi Intelligence Services
console.log("Hello World");
console.log("Phi Services");`,

    `// AI-Powered Solutions
const phiServices = {
    ai: "Machine Learning",
    software: "Development",
    iot: "Smart Systems"
};`,

    `// Welcome Message
console.log("Welcome to Phi Intelligence");
console.log("Transforming businesses with AI");`
  ];

  useEffect(() => {
    if (!isTyping) {
      startTyping();
    }
  }, []);

  const startTyping = async () => {
    setIsTyping(true);
    
    for (let snippetIndex = 0; snippetIndex < codeSnippets.length; snippetIndex++) {
      const snippet = codeSnippets[snippetIndex];
      
      for (let i = 0; i < snippet.length; i++) {
        const char = snippet[i];
        await typeCharacter(char);
        await sleep(getTypingDelay());
      }
      
      if (snippetIndex < codeSnippets.length - 1) {
        await sleep(1000);
      }
    }
    
    await sleep(3000);
    setIsTyping(false);
    setCurrentCode('');
    setCurrentLine(1);
    setCurrentCol(1);
    startTyping(); // Restart the animation
  };

  const typeCharacter = async (char: string) => {
    if (char === '\n') {
      setCurrentLine(prev => prev + 1);
      setCurrentCol(1);
    } else {
      setCurrentCol(prev => prev + 1);
    }
    
    setCurrentCode(prev => prev + char);
  };

  const getTypingDelay = () => {
    const baseDelay = 50;
    const variation = Math.random() * 30 - 15;
    return Math.max(20, baseDelay + variation);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const applySyntaxHighlighting = (code: string) => {
    let highlighted = code;
    
    // Comments
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
    
    // Strings
    highlighted = highlighted.replace(/(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>');
    
    // Keywords
    const keywords = ['import', 'from', 'export', 'default', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'extends', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'typeof', 'instanceof'];
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="keyword">${keyword}</span>`);
    });
    
    // Functions
    highlighted = highlighted.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, '<span class="function">$1</span>(');
    
    // Numbers
    highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');
    
    // Variables and properties
    highlighted = highlighted.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g, '<span class="variable">$1</span>');
    
    return highlighted;
  };

  const generateLineNumbers = () => {
    let numbers = '';
    for (let i = 1; i <= currentLine; i++) {
      numbers += i + '\n';
    }
    return numbers;
  };

  return (
    <div className={`ide-container ${className}`}>
      <div className="title-bar">
        <div className="window-controls">
          <div className="control close"></div>
          <div className="control minimize"></div>
          <div className="control maximize"></div>
        </div>
        <div className="window-title">Phi Intelligence IDE - hello_world.js</div>
      </div>
      
      <div className="toolbar">
        <button className="toolbar-button">File</button>
        <button className="toolbar-button">Edit</button>
        <button className="toolbar-button">View</button>
        <button className="toolbar-button">Go</button>
        <button className="toolbar-button">Run</button>
        <button className="toolbar-button">Terminal</button>
        <button className="toolbar-button">Help</button>
      </div>
      
      <div className="file-tabs">
        <div className="tab active">hello_world.js</div>
        <div className="tab">phi_config.json</div>
        <div className="tab">README.md</div>
      </div>
      
      <div className="main-area">
        <div className="sidebar">
          <div className="sidebar-header">Explorer</div>
          <div className="file-tree">
            <div className="file-item">📁 phi-intelligence</div>
            <div className="file-item selected" style={{ marginLeft: '16px' }}>📄 ai_software.js</div>
            <div className="file-item" style={{ marginLeft: '16px' }}>📄 ai-tools.js</div>
            <div className="file-item" style={{ marginLeft: '16px' }}>📄 phi-core.js</div>
            <div className="file-item">📁 examples</div>
            <div className="file-item" style={{ marginLeft: '16px' }}>📄 basic_demo.js</div>
            <div className="file-item" style={{ marginLeft: '16px' }}>📄 advanced_ai.js</div>
            <div className="file-item">📄 phi_config.json</div>
            <div className="file-item">📄 README.md</div>
          </div>
        </div>
        
        <div className="editor-area">
          <div className="line-numbers">
            {generateLineNumbers()}
          </div>
          <div className="code-editor">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: applySyntaxHighlighting(currentCode) + '<span class="cursor"></span>' 
              }} 
            />
          </div>
          <div className="minimap"></div>
        </div>
      </div>
      
      <div className="status-bar">
        <span>JavaScript</span>
        <span>UTF-8</span>
        <span>LF</span>
        <span>Ln {currentLine}, Col {currentCol}</span>
        <span>{currentCode.length} characters</span>
      </div>

      {/* Removed invalid jsx style syntax - styles are handled by CSS classes */}
    </div>
  );
}
