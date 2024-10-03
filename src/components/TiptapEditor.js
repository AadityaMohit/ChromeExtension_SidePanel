import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlock from '@tiptap/extension-code-block';
import Emoji from './EmojiExtension';
import { db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSmile } from '@fortawesome/free-solid-svg-icons';
import './TiptapEditor.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { setDoc,   serverTimestamp } from 'firebase/firestore'; // Import necessary functions

const TiptapEditor = () => {
  const [codeBlockContent, setCodeBlockContent] = useState('');
  const [savedCodeBlocks, setSavedCodeBlocks] = useState([]);
  const documentId = 'qnUuuKeaCms7OtLT6ZhD';
  const textDocumentId = 'ZGmbaI92DWo1Nn7NBkgp';
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
      StarterKit.configure({ codeBlock: false }),
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

        if (throttleTimeoutRef.current) {
          clearTimeout(throttleTimeoutRef.current);
        }

        throttleTimeoutRef.current = setTimeout(() => {
          saveToFirebase(codeContent[0]);
        }, 3000);
      }
    }
  });

  useEffect(() => {
    fetchCodeBlocks();
  }, []);

  const callExampleFunction = async () => {
    const exampleFunction = httpsCallable(functions, 'test');

    try {
      const result = await exampleFunction();
      console.log(result.data.message);
      toast.success(result.data.message);
    } catch (error) {
      console.error("Error calling function: ", error);
      toast.error("Failed to call function!");
    }
  };
  const handleSaveSelectedText = async () => {
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      toast.error("Chrome API not available. Ensure you're running as a Chrome extension.");
      return;
    }
  
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0]?.id;
  
      console.log("Active Tab ID:", activeTabId); 
  
      if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, { action: "getSelectedText" }, (response) => {
          const selectedText = response?.text;
  
          if (selectedText) {
       
          } else {
            toast.warning("No text selected in the active tab.");
          }
        });
      }
    });
  };
  


  
  

  const handleRandomButtonClick = async () => {
    try {
      const docRef = doc(db, "codeBlocks", documentId);
      const docSnap = await getDoc(docRef);

      let currentCount = 0;
      if (docSnap.exists()) {
        currentCount = docSnap.data().count || 0;
      }

      const updatedCount = currentCount + 1;

      await updateDoc(docRef, {
        randomUpdate: "Triggered from random button",
        count: updatedCount
      });

      toast.success(`Firebase function call succeeded! Count updated to ${updatedCount}`);
    } catch (error) {
      console.error("Error triggering Firebase function: ", error.message);
      toast.error("Firebase function call failed!");
    }
  };

  return (
    <div>
      <div style={{ marginTop: '20px' }}>
        <button onClick={callExampleFunction} className="random-button">
          Call Firebase Function
        </button>
      </div>

      <div className="header-image-container"></div>
      <h2>Tiptap Editor with CodeBlock and Emoji Extension</h2>

      <div className="editor-container">
        <EditorContent editor={editor} />
      </div>

      <div style={{ marginTop: '10px' }}>
        <button className="icon-button" onClick={() => editor && editor.chain().focus().insertEmoji('😊').run()}>
          <FontAwesomeIcon icon={faSmile} /> Insert 😊
        </button>
        <button className="icon-button" onClick={() => editor && editor.chain().focus().insertEmoji('🎉').run()}>
          <FontAwesomeIcon icon={faSmile} /> Insert 🎉
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleRandomButtonClick} className="random-button">
          Random Firebase API Call
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleSaveSelectedText} className="save-selected-text-button">
          Save Selected Text to Firebase
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Saved Code Blocks from Firebase:</h3>
        <ul>
          {savedCodeBlocks.map((block, index) => (
            <li key={index}><pre>{block}</pre></li>
          ))}
        </ul>
      </div>

      <ToastContainer />
    </div>
  );
};

export default TiptapEditor;
