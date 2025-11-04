import React, { useState, useEffect, useCallback } from 'react';
import { Download, Heart, Share, ThumbsUp, Zap, Trash2, X, Play } from 'lucide-react';

const OutputGrid = ({ results, loading, onReset, currentUser }) => {
  const [interactionStates, setInteractionStates] = useState({});
  const [storedResults, setStoredResults] = useState([]);
  const [modalData, setModalData] = useState(null);

  const API_BASE_URL = 'https://try-on-backend-rmp8.onrender.com';

  const getStorageKey = useCallback(() => {
    return currentUser ? `aiOutfitResults_${currentUser.username}` : 'aiOutfitResults_anonymous';
  }, [currentUser]);

  const processResults = useCallback((resultsData) => {
    if (!resultsData) return null;
    
    if (typeof resultsData === 'object' && !Array.isArray(resultsData)) {
      return {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        enhancedProduct: resultsData.enhancedProduct,
        modelFront: resultsData.modelFront || resultsData.tryonResult1,
        productBack: resultsData.productBack,
        modelBack: resultsData.modelBack || resultsData.tryonResult2,
        userId: currentUser?.username,
        ...Object.keys(resultsData).reduce((acc, key) => {
          if (key.startsWith('tryonResult') && key !== 'tryonResult1' && key !== 'tryonResult2') {
            acc[key] = resultsData[key];
          }
          return acc;
        }, {})
      };
    }
    
    return null;
  }, [currentUser]);

  useEffect(() => {
    const storageKey = getStorageKey();
    const savedResults = localStorage.getItem(storageKey);
    if (savedResults) {
      try {
        const parsedResults = JSON.parse(savedResults);
        const resultsWithSequence = parsedResults.map((result, index) => ({
          ...result,
          sequence: parsedResults.length - index
        }));
        setStoredResults(resultsWithSequence);
      } catch (error) {
        console.error('Error loading saved results:', error);
      }
    }
  }, [currentUser, getStorageKey]);

  useEffect(() => {
    if (results && !loading) {
      const processed = processResults(results);
      if (processed) {
        const newResult = {
          ...processed,
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sequence: 1,
          userId: currentUser?.username
        };
        
        setStoredResults(prevStoredResults => {
          const updatedStoredResults = prevStoredResults.map(result => ({
            ...result,
            sequence: result.sequence + 1
          }));
          
          const newResults = [newResult, ...updatedStoredResults];
          const storageKey = getStorageKey();
          localStorage.setItem(storageKey, JSON.stringify(newResults));
          return newResults;
        });
      }
    }
  }, [results, loading, currentUser, getStorageKey, processResults]);

  const createCleanPlaceholder = () => {
    const svg = `
      <svg width="400" height="500" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="500" fill="#ffffff"/>
        <rect x="50" y="50" width="300" height="400" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
        <circle cx="200" cy="250" r="40" fill="#e2e8f0"/>
        <text x="200" y="255" font-family="Arial" font-size="14" text-anchor="middle" fill="#94a3b8">AI</text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const getValidImageUrl = (url) => {
    if (url && typeof url === 'string') {
      if (url.startsWith('/outputs') || url.startsWith('/defaults')) {
        return `${API_BASE_URL}${url}`;
      }
      if (url.startsWith('http')) {
        return url;
      }
    }
    
    return createCleanPlaceholder();
  };

  const handleImageError = (e) => {
    e.target.src = createCleanPlaceholder();
  };

  const handleDownload = (imageUrl, filename) => {
    if (!imageUrl) return;
    
    try {
      const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = filename || 'ai-outfit.jpg';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setInteractionStates(prev => ({
        ...prev,
        [imageUrl]: { ...prev[imageUrl], downloaded: true }
      }));
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleReaction = (imageUrl, reaction) => {
    setInteractionStates(prev => ({
      ...prev,
      [imageUrl]: { ...prev[imageUrl], reaction }
    }));
  };

  const handleShare = (imageUrl) => {
    if (navigator.share) {
      navigator.share({
        title: 'AI Outfit - Virtual Try-On',
        text: 'Check out this AI-generated virtual try-on result!',
        url: imageUrl,
      });
    } else {
      navigator.clipboard.writeText(imageUrl).then(() => {
        alert('Image link copied to clipboard!');
      });
    }
    
    setInteractionStates(prev => ({
      ...prev,
      [imageUrl]: { ...prev[imageUrl], shared: true }
    }));
  };

  const handleFavorite = (imageUrl) => {
    setInteractionStates(prev => ({
      ...prev,
      [imageUrl]: { 
        ...prev[imageUrl], 
        favorite: !prev[imageUrl]?.favorite 
      }
    }));
  };

  const clearAllResults = () => {
    const storageKey = getStorageKey();
    setStoredResults([]);
    localStorage.removeItem(storageKey);
    setModalData(null);
  };

  const deleteResultSet = (resultId) => {
    const newResults = storedResults.filter(result => result.id !== resultId);
    setStoredResults(newResults);
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(newResults));
    setModalData(null);
  };

  const openImageModal = (imageData, resultSet) => {
    setModalData({
      ...imageData,
      resultSet
    });
  };

  const closeImageModal = () => {
    setModalData(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <Zap className="absolute inset-0 m-auto text-blue-500" size={20} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Creating AI Outfit</h2>
        <p className="text-gray-600 max-w-md mb-4">
          Generating professional virtual try-on results...
        </p>
      </div>
    );
  }

  const displayResults = storedResults;

  if (displayResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
          <Zap className="text-white" size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">AI Outfit</h2>
        <p className="text-gray-600 text-lg mb-8">
          Upload model and garments to generate virtual try-on results
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Outfit</h1>
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              <Zap size={16} />
              <span className="font-medium">Powered by Vella 1.5 AI</span>
            </div>
            {storedResults.length > 0 && (
              <button
                onClick={clearAllResults}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-full border border-gray-200 hover:border-gray-300 transition-colors flex items-center gap-2"
              >
                <Trash2 size={14} />
                Clear All ({storedResults.length})
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayResults.map((resultSet, resultIndex) => (
          <div 
            key={resultSet.id || resultIndex} 
            className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-100 bg-white transition-all duration-300 hover:shadow-xl cursor-pointer"
            onClick={() => openImageModal({
              imageUrl: resultSet.modelFront,
              title: 'Model Front View',
              type: 'model'
            }, resultSet)}
          >
            <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100">
              <img
                src={getValidImageUrl(resultSet.modelFront)}
                alt="Model Front View"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                onError={handleImageError}
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-4">

                <div className="flex justify-end gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(resultSet.modelFront, `model-front.jpg`);
                    }}
                    className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-2 rounded-full transition-all duration-200 hover:shadow-lg border border-gray-200 hover:scale-110"
                    title="Download image"
                  >
                    <Download size={18} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavorite(resultSet.modelFront);
                    }}
                    className={`bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full transition-all duration-200 hover:shadow-lg border border-gray-200 hover:scale-110 ${
                      interactionStates[resultSet.modelFront]?.favorite 
                        ? 'text-red-500 border-red-200' 
                        : 'text-gray-700'
                    }`}
                    title="Favorite"
                  >
                    <Heart 
                      size={18} 
                      fill={interactionStates[resultSet.modelFront]?.favorite ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(resultSet.modelFront, 'like');
                        }}
                        className={`bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full transition-all duration-200 hover:shadow-lg border border-gray-200 hover:scale-110 ${
                          interactionStates[resultSet.modelFront]?.reaction === 'like' 
                            ? 'text-green-500 border-green-200' 
                            : 'text-gray-700'
                        }`}
                        title="Like"
                      >
                        <ThumbsUp size={16} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(resultSet.modelFront);
                        }}
                        className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-2 rounded-full transition-all duration-200 hover:shadow-lg border border-gray-200 hover:scale-110"
                        title="Share"
                      >
                        <Share size={16} />
                      </button>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteResultSet(resultSet.id);
                      }}
                      className="bg-red-500/90 backdrop-blur-sm hover:bg-red-600 text-white p-2 rounded-full transition-all duration-200 hover:shadow-lg border border-red-200 hover:scale-110"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">

            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">AI Outfit</h2>
              </div>
              <button
                onClick={closeImageModal}
                className="p-3 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

    
            <div className="flex-1 flex flex-col lg:flex-row min-h-0">
              <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={getValidImageUrl(modalData.imageUrl)}
                    alt={modalData.title}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    style={{ 
                      maxHeight: 'calc(95vh - 200px)',
                      width: 'auto',
                      height: 'auto'
                    }}
                  />
                </div>
              </div>

              <div className="w-full lg:w-80 border-l border-gray-200 bg-white flex flex-col">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Reference Images</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="aspect-square bg-white rounded-lg overflow-hidden mb-2 border border-gray-200 shadow-sm">
                        <img
                          src={getValidImageUrl(modalData.resultSet?.enhancedProduct)}
                          alt="Garment Reference"
                          className="w-full h-full object-contain p-3"
                        />
                      </div>
                      <p className="text-xs font-semibold text-gray-800 bg-gray-100 py-1 px-2 rounded-full">Garment</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2 border border-gray-200 shadow-sm">
                        <img
                          src={getValidImageUrl(modalData.resultSet?.modelFront)}
                          alt="Model Reference"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs font-semibold text-gray-800 bg-gray-100 py-1 px-2 rounded-full">Model</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <button 
                    onClick={() => handleDownload(modalData.imageUrl, `ai-outfit.jpg`)}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                  >
                    <Download size={20} />
                    Download Image
                  </button>
                  
                  <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-3">
                    <Play size={20} />
                    Generate Video
                  </button>
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => handleReaction(modalData.imageUrl, 'like')}
                      className={`p-3 rounded-full transition-all duration-200 ${
                        interactionStates[modalData.imageUrl]?.reaction === 'like' 
                          ? 'bg-green-100 text-green-600 border border-green-200' 
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}
                      title="Like"
                    >
                      <ThumbsUp size={20} />
                    </button>

                    <button
                      onClick={() => handleFavorite(modalData.imageUrl)}
                      className={`p-3 rounded-full transition-all duration-200 ${
                        interactionStates[modalData.imageUrl]?.favorite 
                          ? 'bg-red-100 text-red-600 border border-red-200' 
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}
                      title="Favorite"
                    >
                      <Heart 
                        size={20} 
                        fill={interactionStates[modalData.imageUrl]?.favorite ? "currentColor" : "none"}
                      />
                    </button>

                    <button
                      onClick={() => handleShare(modalData.imageUrl)}
                      className="p-3 rounded-full bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all duration-200"
                      title="Share"
                    >
                      <Share size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="text-center text-xs text-gray-600">
                    <p>The generated contents do not represent the views, products or attributes of AI Try-on.</p>
                    <p className="mt-1">Please use them responsibly and kindly.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutputGrid;