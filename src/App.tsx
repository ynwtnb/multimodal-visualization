import './App.css';
import MultimodalVisualization from './multimodal-visualization';
import { Provider } from 'react-redux';
import store from './multimodal-visualization/store';

function App() {
  return (
    <Provider store={store}>
      <MultimodalVisualization />
    </Provider>
  );
}

export default App;
