import React, { useState, useCallback } from 'react';
import { Upload, FileText, Download, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';

interface ProcessingJob {
  id: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalCards?: number;
  processedCards?: number;
  results?: any[];
  error?: string;
}

interface BatchProcessorProps {
  onComplete?: (results: any[]) => void;
  maxFiles?: number;
  allowedFileTypes?: string[];
}

const BatchProcessor: React.FC<BatchProcessorProps> = ({ 
  onComplete, 
  maxFiles = 10,
  allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
}) => {
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => 
      allowedFileTypes.includes(file.type) && file.size <= 10 * 1024 * 1024 // 10MB limit
    );

    if (jobs.length + validFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newJobs: ProcessingJob[] = validFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      fileName: file.name,
      status: 'pending',
      progress: 0
    }));

    setJobs(prev => [...prev, ...newJobs]);
  };

  const removeJob = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const startProcessing = async () => {
    setIsProcessing(true);
    
    const pendingJobs = jobs.filter(job => job.status === 'pending');
    
    for (const job of pendingJobs) {
      // Update job status to processing
      setJobs(prev => prev.map(j => 
        j.id === job.id ? { ...j, status: 'processing', progress: 0 } : j
      ));

      try {
        // Simulate processing with progress updates
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setJobs(prev => prev.map(j => 
            j.id === job.id ? { ...j, progress } : j
          ));
        }

        // Mock successful completion
        const mockResults = Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, i) => ({
          id: `card-${i}`,
          name: `Contact ${i + 1}`,
          company: `Company ${i + 1}`,
          email: `contact${i + 1}@example.com`,
          phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`
        }));

        setJobs(prev => prev.map(j => 
          j.id === job.id ? { 
            ...j, 
            status: 'completed', 
            progress: 100,
            totalCards: mockResults.length,
            processedCards: mockResults.length,
            results: mockResults
          } : j
        ));

      } catch (error) {
        setJobs(prev => prev.map(j => 
          j.id === job.id ? { 
            ...j, 
            status: 'failed', 
            error: 'Processing failed. Please try again.'
          } : j
        ));
      }
    }

    setIsProcessing(false);
    
    // Call completion callback with all results
    const allResults = jobs
      .filter(job => job.status === 'completed' && job.results)
      .flatMap(job => job.results || []);
    
    if (onComplete && allResults.length > 0) {
      onComplete(allResults);
    }
  };

  const downloadResults = () => {
    const allResults = jobs
      .filter(job => job.status === 'completed' && job.results)
      .flatMap(job => job.results || []);

    if (allResults.length === 0) return;

    const csvContent = [
      ['Name', 'Company', 'Email', 'Phone'],
      ...allResults.map(result => [
        result.name || '',
        result.company || '',
        result.email || '',
        result.phone || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-processing-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-400" />;
      case 'processing':
        return <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const totalResults = jobs
    .filter(job => job.status === 'completed')
    .reduce((sum, job) => sum + (job.processedCards || 0), 0);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Batch Processing</h2>
        <p className="text-gray-600">
          Upload multiple business card images or PDFs for bulk processing
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Drop files here or click to upload
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Supports JPEG, PNG, WebP, and PDF files (max 10MB each)
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Maximum {maxFiles} files per batch
        </p>
        
        <input
          type="file"
          multiple
          accept={allowedFileTypes.join(',')}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <Upload className="w-4 h-4 mr-2" />
          Select Files
        </button>
      </div>

      {/* Processing Queue */}
      {jobs.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Processing Queue</h3>
            <div className="flex space-x-3">
              {totalResults > 0 && (
                <button
                  onClick={downloadResults}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Results ({totalResults} contacts)
                </button>
              )}
              <button
                onClick={startProcessing}
                disabled={isProcessing || jobs.every(job => job.status !== 'pending')}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <FileText className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Start Processing'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(job.status)}
                    <span className="font-medium text-gray-900">{job.fileName}</span>
                    {job.status === 'completed' && job.processedCards && (
                      <span className="text-sm text-green-600">
                        {job.processedCards} contacts extracted
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 capitalize">{job.status}</span>
                    {job.status === 'pending' && (
                      <button
                        onClick={() => removeJob(job.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {job.status === 'processing' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                )}

                {job.status === 'failed' && job.error && (
                  <p className="text-sm text-red-600 mt-1">{job.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {jobs.length > 0 && (
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Batch Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Total Files:</span>
              <span className="font-medium text-blue-900 ml-1">{jobs.length}</span>
            </div>
            <div>
              <span className="text-blue-700">Completed:</span>
              <span className="font-medium text-blue-900 ml-1">
                {jobs.filter(j => j.status === 'completed').length}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Processing:</span>
              <span className="font-medium text-blue-900 ml-1">
                {jobs.filter(j => j.status === 'processing').length}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Total Contacts:</span>
              <span className="font-medium text-blue-900 ml-1">{totalResults}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchProcessor; 