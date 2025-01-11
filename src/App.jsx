import { useTranslation } from 'react-i18next';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import ChatInterface from './components/ChatInterface';
import './i18n/i18n';

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#4CAF50',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

export default function App() {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position='static' color='transparent' elevation={0}>
          <Toolbar>
            <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
              {t('app.title')}
            </Typography>
            <IconButton onClick={toggleLanguage} color='inherit'>
              <LanguageIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>
          <ChatInterface />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
