import { AppRoutes } from './routes/AppRoutes.jsx';
import { AppBackground } from './components/AppBackground.jsx';
import { SmoothCursor } from './components/ui/smooth-cursor.jsx';

export default function App() {
  return (
    <AppBackground>
      <SmoothCursor />
      <AppRoutes />
    </AppBackground>
  );
}
