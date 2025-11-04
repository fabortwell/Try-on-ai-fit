import React from 'react';
import { Upload, Image, Info, AlertCircle, CheckCircle, X, Trash2 } from 'lucide-react';

// Import all local images
import model1 from '../images/model1.png';
import model2 from '../images/model2.jpeg';
import model3 from '../images/model3.png';
import model4 from '../images/model4.jpg';
import model5 from '../images/model5.png';
import model6 from '../images/model6.jpg';
import model7 from '../images/model7.jpg';
import model8 from '../images/model8.png';
import top2 from '../images/top2.png';
import top3 from '../images/top3.png';
import top4 from '../images/top4.png';
import bottom1 from '../images/bottom1.png';
import dress from '../images/dress.png';

const LeftPanel = ({
  selectedOutputs,
  onGenerate,
  loading,
  errors,
  success,

  modelTab,
  setModelTab,
  modelImage,
  setModelImage,
  selectedDefaultModel,
  setSelectedDefaultModel,

  garmentTab,
  setGarmentTab,
  singleGarmentImage,
  setSingleGarmentImage,
  topGarmentImage,
  setTopGarmentImage,
  bottomGarmentImage,
  setBottomGarmentImage,

  selectedGarmentId,
  setSelectedGarmentId,
  selectedTopGarmentId,
  setSelectedTopGarmentId,
  selectedBottomGarmentId,
  setSelectedBottomGarmentId,
  resetAll,
}) => {
  const canGenerate = () => {
    const hasModel = (modelTab === 'upload' && modelImage) || 
                    (modelTab === 'default' && selectedDefaultModel);
    
    if (!hasModel) {
      return false;
    }
    if (garmentTab === 'single') {
      const hasSingleGarment = !!singleGarmentImage || !!selectedGarmentId;
      return hasSingleGarment;
    } else if (garmentTab === 'multiple') {
      const hasTop = !!topGarmentImage || !!selectedTopGarmentId;
      const hasBottom = !!bottomGarmentImage || !!selectedBottomGarmentId;
      const hasMultipleGarments = hasTop || hasBottom;
      
      return hasMultipleGarments;
    }
    
    return false;
  };

  const handleModelUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setModelImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSingleGarmentUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSingleGarmentImage(e.target.result);
        setSelectedGarmentId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTopGarmentUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTopGarmentImage(e.target.result);
        setSelectedTopGarmentId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBottomGarmentUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBottomGarmentImage(e.target.result);
        setSelectedBottomGarmentId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteModelImage = (e) => {
    e.stopPropagation();
    setModelImage(null);
  };

  const deleteSingleGarment = (e) => {
    e.stopPropagation();
    setSingleGarmentImage(null);
    setSelectedGarmentId(null);
  };

  const deleteTopGarment = (e) => {
    e.stopPropagation();
    setTopGarmentImage(null);
    setSelectedTopGarmentId(null);
  };

  const deleteBottomGarment = (e) => {
    e.stopPropagation();
    setBottomGarmentImage(null);
    setSelectedBottomGarmentId(null);
  };

  const clearDefaultModel = () => {
    setSelectedDefaultModel(null);
  };

  const handleGarmentTabChange = (tab) => {
    if (tab !== garmentTab) {
      setSingleGarmentImage(null);
      setTopGarmentImage(null);
      setBottomGarmentImage(null);
      setSelectedGarmentId(null);
      setSelectedTopGarmentId(null);
      setSelectedBottomGarmentId(null);
    }
    setGarmentTab(tab);
  };

  const defaultModels = [
    { id: 1, url: model1 },
    { id: 2, url: model2 },
    { id: 3, url: model3 },
    { id: 4, url: model4 },
    { id: 5, url: model5 },
    { id: 6, url: model6 },
    { id: 7, url: model7 },
    { id: 8, url: model8 }
  ];

  const sampleGarments = [
    { id: 'top2', url: top2, name: "Jacket", type: 'top' },
    { id: 'top3', url: top3, name: "Blouse", type: 'top' },
    { id: 'top4', url: top4, name: "Sweater", type: 'top' },
    { id: 'dress', url: dress, name: "Dress", type: 'dress' },
    { id: 'bottom1', url: bottom1, name: "Jeans", type: 'bottom' }
  ];

  const handleSampleGarmentClick = (garmentId) => {
    const garment = sampleGarments.find(g => g.id === garmentId);
    if (!garment) return;

    if (garmentTab === 'single') {
      setSingleGarmentImage(garment.url);
      setSelectedGarmentId(garmentId);
      setTopGarmentImage(null);
      setBottomGarmentImage(null);
      setSelectedTopGarmentId(null);
      setSelectedBottomGarmentId(null);
    } else if (garmentTab === 'multiple') {
      if (garment.type === 'top' || garment.type === 'dress') {
        setTopGarmentImage(garment.url);
        setSelectedTopGarmentId(garmentId);
        setSingleGarmentImage(null);
        setSelectedGarmentId(null);
      } else if (garment.type === 'bottom') {
        setBottomGarmentImage(garment.url);
        setSelectedBottomGarmentId(garmentId);
        
 
        setSingleGarmentImage(null);
        setSelectedGarmentId(null);
      }
    }
  };

  const handleGenerateClick = () => {
    if (!canGenerate() || loading) {
      return;
    }

    const generationData = {
      modelType: modelTab,
      garmentType: garmentTab,
      outputCount: selectedOutputs.toString(),
      seed: Math.floor(Math.random() * 1000000).toString(),
    };

    if (modelTab === 'default' && selectedDefaultModel) {
      generationData.modelId = selectedDefaultModel.toString();
    }

    if (garmentTab === 'single') {
      if (selectedGarmentId) {
        const garment = sampleGarments.find(g => g.id === selectedGarmentId);
        generationData.garmentData = JSON.stringify({
          id: selectedGarmentId,
          garmentType: garment?.type || 'top'
        });
      } else if (singleGarmentImage) {
        generationData.garmentData = JSON.stringify({
          id: 'uploaded',
          garmentType: 'top'
        });
      }
    } else if (garmentTab === 'multiple') {
      const garmentData = {};
      
      if (selectedTopGarmentId || topGarmentImage) {
        if (selectedTopGarmentId) {
          const topGarment = sampleGarments.find(g => g.id === selectedTopGarmentId);
          garmentData.top = {
            id: selectedTopGarmentId,
            garmentType: topGarment?.type || 'top'
          };
        } else if (topGarmentImage) {
          garmentData.top = {
            id: 'uploaded',
            garmentType: 'top'
          };
        }
      }
    
      if (selectedBottomGarmentId || bottomGarmentImage) {
        if (selectedBottomGarmentId) {
          const bottomGarment = sampleGarments.find(g => g.id === selectedBottomGarmentId);
          garmentData.bottom = {
            id: selectedBottomGarmentId,
            garmentType: bottomGarment?.type || 'bottom'
          };
        } else if (bottomGarmentImage) {
          garmentData.bottom = {
            id: 'uploaded',
            garmentType: 'bottom'
          };
        }
      }
      generationData.garmentData = JSON.stringify(garmentData);
    }
    
    if (typeof onGenerate === 'function') {
      onGenerate(generationData);
    } else {
      alert('Error: Generation function not available. Please check the console.');
    }
  };

  const getSelectedGarmentName = (garmentId) => {
    const garment = sampleGarments.find(g => g.id === garmentId);
    return garment ? garment.name : 'Custom';
  };

  return (
    <div className="flex flex-col justify-between h-full space-y-6">
      <div className="hidden lg:block mb-2">
        <h1 className="text-2xl font-semibold text-primary mb-1">TryFit AI </h1>
        <p className="text-sm text-grayText">Upload a model and garments to generate outfits</p>
      </div>

      {errors.model && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-500" size={18} />
          <span className="text-red-700 text-sm">{errors.model}</span>
        </div>
      )}

      {errors.garment && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-500" size={18} />
          <span className="text-red-700 text-sm">{errors.garment}</span>
        </div>
      )}

      {errors.api && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-500" size={18} />
          <span className="text-red-700 text-sm">{errors.api}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="text-green-500" size={18} />
          <span className="text-green-700 text-sm">{success}</span>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2 lg:gap-4">
            <button
              className={`text-sm px-3 lg:px-4 py-2 rounded-md transition-colors ${
                modelTab === "default"
                  ? "bg-primary text-white shadow-md"
                  : "text-grayText hover:text-primary bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setModelTab("default")}
            >
              Default
            </button>
            <button
              className={`text-sm px-3 lg:px-4 py-2 rounded-md transition-colors ${
                modelTab === "upload"
                  ? "bg-primary text-white shadow-md"
                  : "text-grayText hover:text-primary bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setModelTab("upload")}
            >
              Upload
            </button>
          </div>
          <div className="flex items-center gap-2 text-grayText hover:text-primary cursor-pointer transition-colors">
            <Info size={16} />
            <span className="text-sm font-medium">Guideline</span>
          </div>
        </div>
        {modelTab === "default" && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-grayText">Choose a default model:</p>
              {selectedDefaultModel && (
                <button
                  onClick={clearDefaultModel}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={12} />
                  Clear
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {defaultModels.slice(0, 4).map((model) => (
                  <div
                    key={model.id}
                    className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 group ${
                      selectedDefaultModel === model.id 
                        ? "border-primary ring-2 ring-primary/20 shadow-md" 
                        : "border-gray-200 hover:border-primary hover:shadow-sm"
                    }`}
                    onClick={() => setSelectedDefaultModel(model.id)}
                  >
                    <div className="aspect-[3/4] relative overflow-hidden">
                      <img
                        src={model.url}
                        alt={`Model ${model.id}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {selectedDefaultModel === model.id && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-md">
                          <CheckCircle size={12} className="text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {defaultModels.slice(4, 8).map((model) => (
                  <div
                    key={model.id}
                    className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 group ${
                      selectedDefaultModel === model.id 
                        ? "border-primary ring-2 ring-primary/20 shadow-md" 
                        : "border-gray-200 hover:border-primary hover:shadow-sm"
                    }`}
                    onClick={() => setSelectedDefaultModel(model.id)}
                  >
                    <div className="aspect-[3/4] relative overflow-hidden">
                      <img
                        src={model.url}
                        alt={`Model ${model.id}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {selectedDefaultModel === model.id && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-md">
                          <CheckCircle size={12} className="text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {modelTab === "upload" && (
          <div>
            <input
              type="file"
              id="model-upload"
              accept="image/*"
              onChange={handleModelUpload}
              className="hidden"
            />
            <label
              htmlFor="model-upload"
              className="relative bg-darkBg border-2 border-dashed border-gray-400 rounded-xl p-6 flex flex-col items-center justify-center hover:border-primary transition-all cursor-pointer h-40"
            >
              {modelImage ? (
                <>
                  <button
                    onClick={deleteModelImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10 shadow-md"
                  >
                    <X size={14} />
                  </button>
                  <img
                    src={modelImage}
                    alt="Uploaded model"
                    className="w-16 h-16 object-cover rounded-lg mb-2 shadow-sm"
                  />
                  <p className="text-grayText text-sm font-medium">Model uploaded ✓</p>
                  <p className="text-grayText text-xs mt-1">Click to change</p>
                </>
              ) : (
                <>
                  <Upload className="text-primary mb-2" size={32} />
                  <p className="text-grayText font-medium">Upload a model image</p>
                </>
              )}
            </label>
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2 lg:gap-4">
            <button
              className={`text-sm px-3 lg:px-4 py-2 rounded-md transition-colors ${
                garmentTab === "single"
                  ? "bg-primary text-white shadow-md"
                  : "text-grayText hover:text-primary bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => handleGarmentTabChange("single")}
            >
              Single Garment
            </button>
            <button
              className={`text-sm px-3 lg:px-4 py-2 rounded-md transition-colors ${
                garmentTab === "multiple"
                  ? "bg-primary text-white shadow-md"
                  : "text-grayText hover:text-primary bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => handleGarmentTabChange("multiple")}
            >
              Multiple Garments
            </button>
          </div>
          <div className="flex items-center gap-2 text-grayText hover:text-primary cursor-pointer transition-colors">
            <Info size={16} />
            <span className="text-sm font-medium">Guideline</span>
          </div>
        </div>

        {garmentTab === "single" && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <input
              type="file"
              id="single-garment-upload"
              accept="image/*"
              onChange={handleSingleGarmentUpload}
              className="hidden"
            />
            <label
              htmlFor="single-garment-upload"
              className="relative bg-darkBg border-2 border-dashed border-gray-400 rounded-xl p-6 flex flex-col items-center justify-center hover:border-primary transition-all cursor-pointer h-40 mb-4"
            >
              {singleGarmentImage ? (
                <>
                  <button
                    onClick={deleteSingleGarment}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10 shadow-md"
                  >
                    <X size={14} />
                  </button>
                  <img
                    src={singleGarmentImage}
                    alt="Uploaded garment"
                    className="w-16 h-16 object-cover rounded-lg mb-2 shadow-sm"
                  />
                  <p className="text-grayText text-sm font-medium">Garment uploaded ✓</p>
                  <p className="text-grayText text-xs mt-1">
                    {selectedGarmentId ? getSelectedGarmentName(selectedGarmentId) : 'Click to change'}
                  </p>
                </>
              ) : (
                <>
                  <Image className="text-primary mb-2" size={32} />
                  <p className="text-grayText font-medium">Upload Single Garment</p>
                </>
              )}
            </label>

            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700">Sample Garments:</span>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {sampleGarments.map((garment) => (
                  <div 
                    key={garment.id} 
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 group ${
                      selectedGarmentId === garment.id
                        ? "border-primary ring-2 ring-primary/20 shadow-md" 
                        : "border-gray-200 hover:border-primary hover:shadow-sm"
                    }`}
                    onClick={() => handleSampleGarmentClick(garment.id)}
                  >
                    <div className="aspect-square relative bg-white">
                      <img
                        src={garment.url}
                        alt={garment.name}
                        className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                      />
            
                      {selectedGarmentId === garment.id && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-md">
                          <CheckCircle size={12} className="text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {garmentTab === "multiple" && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">Select top and/or bottom garments:</p>
              <div className="flex gap-4 text-xs">
                {selectedTopGarmentId && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Top: {getSelectedGarmentName(selectedTopGarmentId)}
                  </span>
                )}
                {selectedBottomGarmentId && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                    Bottom: {getSelectedGarmentName(selectedBottomGarmentId)}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="relative">
                <input
                  type="file"
                  id="top-garment-upload"
                  accept="image/*"
                  onChange={handleTopGarmentUpload}
                  className="hidden"
                />
                <label
                  htmlFor="top-garment-upload"
                  className="relative bg-darkBg border-2 border-dashed border-gray-400 rounded-xl p-4 flex flex-col items-center justify-center hover:border-primary transition-all cursor-pointer h-32"
                >
                  {topGarmentImage ? (
                    <>
                      <button
                        onClick={deleteTopGarment}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10 shadow-md"
                      >
                        <X size={12} />
                      </button>
                      <img
                        src={topGarmentImage}
                        alt="Uploaded top"
                        className="w-12 h-12 object-cover rounded-lg mb-1 shadow-sm"
                      />
                      <p className="text-grayText text-xs font-medium">
                        {selectedTopGarmentId ? getSelectedGarmentName(selectedTopGarmentId) : 'Top ✓'}
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="text-primary mb-1" size={24} />
                      <p className="text-grayText text-sm text-center font-medium">Upload Top</p>
                    </>
                  )}
                </label>
              </div>

              <div className="relative">
                <input
                  type="file"
                  id="bottom-garment-upload"
                  accept="image/*"
                  onChange={handleBottomGarmentUpload}
                  className="hidden"
                />
                <label
                  htmlFor="bottom-garment-upload"
                  className="relative bg-darkBg border-2 border-dashed border-gray-400 rounded-xl p-4 flex flex-col items-center justify-center hover:border-primary transition-all cursor-pointer h-32"
                >
                  {bottomGarmentImage ? (
                    <>
                      <button
                        onClick={deleteBottomGarment}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10 shadow-md"
                      >
                        <X size={12} />
                      </button>
                      <img
                        src={bottomGarmentImage}
                        alt="Uploaded bottom"
                        className="w-12 h-12 object-cover rounded-lg mb-1 shadow-sm"
                      />
                      <p className="text-grayText text-xs font-medium">
                        {selectedBottomGarmentId ? getSelectedGarmentName(selectedBottomGarmentId) : 'Bottom ✓'}
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="text-primary mb-1" size={24} />
                      <p className="text-grayText text-sm text-center font-medium">Upload Bottom</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700">Sample Garments:</span>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {sampleGarments.map((garment) => (
                  <div 
                    key={garment.id} 
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 group ${
                      ((garment.type === 'top' || garment.type === 'dress') && selectedTopGarmentId === garment.id) ||
                      (garment.type === 'bottom' && selectedBottomGarmentId === garment.id)
                        ? "border-primary ring-2 ring-primary/20 shadow-md" 
                        : "border-gray-200 hover:border-primary hover:shadow-sm"
                    }`}
                    onClick={() => handleSampleGarmentClick(garment.id)}
                  >
                    <div className="aspect-square relative bg-white">
                      <img
                        src={garment.url}
                        alt={garment.name}
                        className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                      />
                      {((garment.type === 'top' || garment.type === 'dress') && selectedTopGarmentId === garment.id) ||
                       (garment.type === 'bottom' && selectedBottomGarmentId === garment.id) ? (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-md">
                          <CheckCircle size={12} className="text-white" />
                        </div>
                      ) : null}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={handleGenerateClick}
          disabled={!canGenerate() || loading}
          className={`px-8 py-3 font-semibold rounded-xl transition-all duration-300 ${
            !canGenerate() || loading
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed shadow-sm'
              : 'bg-primary hover:bg-accent text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating...
            </div>
          ) : (
            'Generate'
          )}
        </button>
      </div>
    </div>
  );
};

export default LeftPanel;