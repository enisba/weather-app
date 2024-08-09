import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import Weather from './components/Weather';

const App: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>

        <Weather />
      </Box>
    </Container>
  );
};

export default App;
