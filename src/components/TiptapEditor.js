import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlock from '@tiptap/extension-code-block';
import Emoji from './EmojiExtension';
import { db } from '../firebase';  
import { doc, updateDoc, getDoc } from 'firebase/firestore';  
import './TiptapEditor.css'; 

const TiptapEditor = () => {
  const [codeBlockContent, setCodeBlockContent] = useState('');    
  const [savedCodeBlocks, setSavedCodeBlocks] = useState([]);  
  const documentId = 'qnUuuKeaCms7OtLT6ZhD';  

  // Throttle timeout reference
  const throttleTimeoutRef = useRef(null);

  const saveToFirebase = async (content) => {
    try {
      const docRef = doc(db, "codeBlocks", documentId);   
      await updateDoc(docRef, {
        content: content,  
      });
      console.log("Code block updated!");
      fetchCodeBlocks();   
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  const fetchCodeBlocks = async () => {
    try {
      const docRef = doc(db, "codeBlocks", documentId);   
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const blocks = docSnap.data().content;
        setSavedCodeBlocks([blocks]);   

        if (editor) {
          editor.commands.setContent(`<pre><code>${blocks}</code></pre>`);   
        }
      } else {
        console.log("No such document!");
      }
    } catch (e) {
      console.error("Error fetching document: ", e);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,  
      }),
      Emoji, 
      CodeBlock.configure({
        exitOnTripleEnter: true, 
        languageClassPrefix: 'language-',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const codeBlocks = html.match(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g);  
      if (codeBlocks && codeBlocks.length > 0) {
        const codeContent = codeBlocks.map(block => block.replace(/<\/?[^>]+(>|$)/g, ""));
        setCodeBlockContent(codeContent[0]);  

        // Clear any existing throttle timeout
        if (throttleTimeoutRef.current) {
          clearTimeout(throttleTimeoutRef.current);
        }

        // Set a new timeout to save the content after 5 seconds of inactivity
        throttleTimeoutRef.current = setTimeout(() => {
          saveToFirebase(codeContent[0]);   
        }, 3000);   
      }
    }
  });

  useEffect(() => {
    fetchCodeBlocks();  
  }, []);

  return (
    <div>
      <h2>Tiptap Editor with CodeBlock and Emoji Extension</h2>

      <div className="editor-container">
        <EditorContent editor={editor} />
      </div>
      <div style={{ marginTop: '10px' }}>   
        <button onClick={() => editor && editor.chain().focus().insertEmoji('😊').run()}>Insert 😊</button>
        <button onClick={() => editor && editor.chain().focus().insertEmoji('🎉').run()}>Insert 🎉</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Saved Code Blocks from Firebase:</h3>
        <ul>
          {savedCodeBlocks.map((block, index) => (
            <li key={index}><pre>{block}</pre></li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TiptapEditor;
