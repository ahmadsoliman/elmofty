import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  CircularProgress,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import SendIcon from '@mui/icons-material/Send';
import { styled } from '@mui/material/styles';

const ChatContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  maxWidth: 800,
  margin: '0 auto',
  height: '80vh',
  display: 'flex',
  flexDirection: 'column',
}));

const MessagesContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  overflowY: 'auto',
  marginBottom: 2,
});

const Message = styled(Box)(({ isUser, theme }) => ({
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  maxWidth: '80%',
  alignSelf: isUser ? 'flex-start' : 'flex-end',

  backgroundColor: isUser
    ? theme.palette.primary.main
    : theme.palette.grey[200],
  color: isUser
    ? theme.palette.primary.contrastText
    : theme.palette.text.primary,
}));

export default function ChatInterface() {
  const { i18n, t } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ question: input }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      setMessages((prev) => [...prev, { text: data.answer, isUser: false }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.map((message, index) => (
          <Message key={index} isUser={message.isUser}>
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </Message>
        ))}
        {isLoading && (
          <Box display='flex' justifyContent='center' my={2}>
            <CircularProgress />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <Box display='flex' gap={1}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('chat.placeholder')}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <IconButton onClick={handleSend} color='primary'>
          <SendIcon className={isRTL ? 'rtl-flip' : ''} />
        </IconButton>
      </Box>
    </ChatContainer>
  );
}
