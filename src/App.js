import React, { useState, useEffect } from "react";
import LeftPanel from "./components/LeftPanel";
import OutputGrid from "./components/OutputGrid";
import AuthPage from "./components/AuthPage";
import Sidebar from "./components/Sidebar";
import { User, LogOut } from "lucide-react";

function App() {
  const [results, setResults] = useState(null);
  const [selectedOutputs, setSelectedOutputs] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const [modelImage, setModelImage] = useState(null);
  const [singleGarmentImage, setSingleGarmentImage] = useState(null);
  const [topGarmentImage, setTopGarmentImage] = useState(null);
  const [bottomGarmentImage, setBottomGarmentImage] = useState(null);
  const [garmentTab, setGarmentTab] = useState("single");
  const [modelTab, setModelTab] = useState("default");
  const [selectedDefaultModel, setSelectedDefaultModel] = useState(1);

  const [selectedGarmentId, setSelectedGarmentId] = useState(null);
  const [selectedTopGarmentId, setSelectedTopGarmentId] = useState(null);
  const [selectedBottomGarmentId, setSelectedBottomGarmentId] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const API_BASE_URL = 'https://try-on-backend-rmp8.onrender.com';

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setAuthLoading(false);
  }, []);

  const handleSignIn = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleSignOut = () => {
    localStorage.removeItem('currentUser');
    const userKeys = Object.keys(localStorage).filter(key => key.startsWith('aiOutfitResults_'));
    userKeys.forEach(key => localStorage.removeItem(key));
    
    setCurrentUser(null);
    resetAll();
  };

  const getAuthHeaders = () => {
    const headers = {};
    if (currentUser && currentUser.token) {
      headers['Authorization'] = `Bearer ${currentUser.token}`;
    }
    return headers;
  };

  const dataURLtoFile = (dataurl, filename) => {
    if (!dataurl || !dataurl.startsWith('data:')) {
      return null;
    }
    try {
      const arr = dataurl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } catch (error) {
      return null;
    }
  };

  const handleGenerate = async (generationData) => {
    if (!currentUser) {
      setErrors({ api: 'Please sign in to generate try-ons' });
      return;
    }

    if (!generationData || !generationData.modelType || !generationData.garmentType) {
      setErrors({ api: 'Invalid generation data. Please ensure all fields are properly selected.' });
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess("");
    setResults(null);

    try {
      const formData = new FormData();
      
      if (generationData.modelType === "upload") {
        if (modelImage) {
          const modelFile = dataURLtoFile(modelImage, 'model.png');
          if (modelFile) {
            formData.append('modelImage', modelFile);
          }
        }
      } else if (generationData.modelType === "default") {
        if (generationData.modelId) {
          formData.append('modelId', generationData.modelId);
        }
      }

      if (generationData.garmentType === "single") {
        if (singleGarmentImage) {
          const garmentFile = dataURLtoFile(singleGarmentImage, 'single-garment.png');
          if (garmentFile) {
            formData.append('singleGarmentImage', garmentFile);
          }
        }

      } else if (generationData.garmentType === "multiple") {
        if (topGarmentImage) {
          const topFile = dataURLtoFile(topGarmentImage, 'top-garment.png');
          if (topFile) {
            formData.append('topGarmentImage', topFile);
          }
        }

        if (bottomGarmentImage) {
          const bottomFile = dataURLtoFile(bottomGarmentImage, 'bottom-garment.png');
          if (bottomFile) {
            formData.append('bottomGarmentImage', bottomFile);
          }
        }
      }

      formData.append('modelType', generationData.modelType);
      formData.append('garmentType', generationData.garmentType);
      formData.append('outputCount', generationData.outputCount || selectedOutputs.toString());
      formData.append('seed', generationData.seed || Math.floor(Math.random() * 1000000).toString());

      if (generationData.garmentData) {
        formData.append('garmentData', generationData.garmentData);
      }

      try {
        const healthResponse = await fetch(`${API_BASE_URL}/api/health`, {
          headers: {
            ...getAuthHeaders()
          }
        });
        
        if (healthResponse.status === 401) {
          throw new Error('Authentication failed. Please sign in again.');
        }
        
        await healthResponse.json();
      } catch (healthError) {
        if (healthError.message.includes('Authentication failed')) {
          throw new Error('Authentication failed. Please sign in again.');
        } else {
          throw new Error(`Backend server is not responding. Please make sure the backend is running on ${API_BASE_URL}`);
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/generate`, {
        method: 'POST',
        body: formData,
        headers: {
          ...getAuthHeaders()
        }
      });

      if (response.status === 401) {
        throw new Error('Authentication failed. Please sign in again.');
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      const requestId = data.requestId;

      if (!requestId) {
        throw new Error('No request ID received from server');
      }

      setSuccess('AI generation started! Processing...');

      const pollResults = async (attempt = 0) => {
        const maxAttempts = 60;
        
        try {
          const statusResponse = await fetch(`${API_BASE_URL}/api/status/${requestId}`, {
            headers: {
              ...getAuthHeaders()
            }
          });
          
          if (statusResponse.status === 401) {
            throw new Error('Authentication failed during processing. Please sign in again.');
          }

          if (!statusResponse.ok) {
            throw new Error(`Status check failed: ${statusResponse.status}`);
          }

          const statusData = await statusResponse.json();

          if (statusData.status === 'completed') {
            setResults(statusData.results);
            setLoading(false);
            setSuccess('Successfully generated virtual try-on results!');
            setTimeout(() => setSuccess(""), 5000);
          } else if (statusData.status === 'failed') {
            throw new Error(statusData.error || 'Generation failed on server');
          } else {
            if (attempt >= maxAttempts) {
              throw new Error('Generation timeout - server is taking too long to process');
            }

            setTimeout(() => pollResults(attempt + 1), 5000);
          }
        } catch (error) {
          setLoading(false);
          setErrors({ api: error.message });
        }
      };

      pollResults();

    } catch (error) {
      setLoading(false);
      setErrors({ api: error.message });
      
      if (error.message.includes('Authentication failed')) {
        setTimeout(() => {
          handleSignOut();
        }, 2000);
      }
    }
  };

  const resetAll = () => {
    setModelImage(null);
    setSingleGarmentImage(null);
    setTopGarmentImage(null);
    setBottomGarmentImage(null);
    setSelectedDefaultModel(1);
    setSelectedGarmentId(null);
    setSelectedTopGarmentId(null);
    setSelectedBottomGarmentId(null);
    setResults(null);
    setErrors({});
    setSuccess("");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lightBg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-grayText">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage onSignIn={handleSignIn} />;
  }

  return (
    <div className="min-h-screen bg-lightBg flex">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <header className="bg-whiteBg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <div className="flex items-center">
                <h1 className="text-xl sm:text-2xl font-bold text-darkText">AI Try-On Generator</h1>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-1 sm:gap-2 text-grayText">
                  <User size={16} className="sm:w-5" />
                  <span className="font-medium text-sm sm:text-base">{currentUser.username}</span>
                  {currentUser.token && (
                    <span className="hidden sm:inline text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Authenticated
                    </span>
                  )}
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-grayText hover:text-darkText hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <LogOut size={14} className="sm:w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="block lg:hidden">
              <div className="p-3 sm:p-4">
                <LeftPanel
                  selectedOutputs={selectedOutputs}
                  setSelectedOutputs={setSelectedOutputs}
                  onGenerate={handleGenerate}
                  loading={loading}
                  errors={errors}
                  success={success}
                  modelTab={modelTab}
                  setModelTab={setModelTab}
                  modelImage={modelImage}
                  setModelImage={setModelImage}
                  selectedDefaultModel={selectedDefaultModel}
                  setSelectedDefaultModel={setSelectedDefaultModel}
                  garmentTab={garmentTab}
                  setGarmentTab={setGarmentTab}
                  singleGarmentImage={singleGarmentImage}
                  setSingleGarmentImage={setSingleGarmentImage}
                  topGarmentImage={topGarmentImage}
                  setTopGarmentImage={setTopGarmentImage}
                  bottomGarmentImage={bottomGarmentImage}
                  setBottomGarmentImage={setBottomGarmentImage}
                  selectedGarmentId={selectedGarmentId}
                  setSelectedGarmentId={setSelectedGarmentId}
                  selectedTopGarmentId={selectedTopGarmentId}
                  setSelectedTopGarmentId={setSelectedTopGarmentId}
                  selectedBottomGarmentId={selectedBottomGarmentId}
                  setSelectedBottomGarmentId={setSelectedBottomGarmentId}
                  resetAll={resetAll}
                />
              </div>

              <div className="p-3 sm:p-4 border-t border-gray-200">
                <OutputGrid 
                  results={results} 
                  loading={loading}
                  onReset={resetAll}
                  currentUser={currentUser}
                />
              </div>
            </div>

            <div className="hidden lg:flex">
              <div className="w-[32%] border-r border-gray-200 p-6 flex flex-col justify-between">
                <LeftPanel
                  selectedOutputs={selectedOutputs}
                  setSelectedOutputs={setSelectedOutputs}
                  onGenerate={handleGenerate}
                  loading={loading}
                  errors={errors}
                  success={success}
                  modelTab={modelTab}
                  setModelTab={setModelTab}
                  modelImage={modelImage}
                  setModelImage={setModelImage}
                  selectedDefaultModel={selectedDefaultModel}
                  setSelectedDefaultModel={setSelectedDefaultModel}
                  garmentTab={garmentTab}
                  setGarmentTab={setGarmentTab}
                  singleGarmentImage={singleGarmentImage}
                  setSingleGarmentImage={setSingleGarmentImage}
                  topGarmentImage={topGarmentImage}
                  setTopGarmentImage={setTopGarmentImage}
                  bottomGarmentImage={bottomGarmentImage}
                  setBottomGarmentImage={setBottomGarmentImage}
                  selectedGarmentId={selectedGarmentId}
                  setSelectedGarmentId={setSelectedGarmentId}
                  selectedTopGarmentId={selectedTopGarmentId}
                  setSelectedTopGarmentId={setSelectedTopGarmentId}
                  selectedBottomGarmentId={selectedBottomGarmentId}
                  setSelectedBottomGarmentId={setSelectedBottomGarmentId}
                  resetAll={resetAll}
                />
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <OutputGrid 
                  results={results} 
                  loading={loading}
                  onReset={resetAll}
                  currentUser={currentUser}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;