import BusinessCardDisplay from './components/BusinessCardDisplay';
import './index.css';

function App() {
  const sampleData = {
    name: "John Doe",
    title: "Senior Developer",
    company: "Tech Solutions Inc",
    email: "john@techsolutions.com",
    phone: "+1 (555) 123-4567",
    confidence: 0.95
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Business Card Scanner</h1>
        <BusinessCardDisplay data={sampleData} />
      </div>
    </div>
  );
}

export default App;