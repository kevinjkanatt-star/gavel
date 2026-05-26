import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Loader2, FileText, Plus, Trash2, Download, Eye } from 'lucide-react';
import { jsPDF } from 'jspdf';

import API_URL from '../lib/api';

const AffidavitBuilder = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    affiant_name: user?.name || '',
    affiant_address: '',
    purpose: '',
    court_name: '',
    case_number: '',
  });
  const [facts, setFacts] = useState(['']);
  const [generatedText, setGeneratedText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [editedText, setEditedText] = useState('');

  const addFact = () => setFacts([...facts, '']);

  const removeFact = (index) => {
    if (facts.length > 1) {
      setFacts(facts.filter((_, i) => i !== index));
    }
  };

  const updateFact = (index, value) => {
    const updated = [...facts];
    updated[index] = value;
    setFacts(updated);
  };

  const handleGenerate = async () => {
    if (!formData.affiant_name || !formData.purpose || facts.filter(f => f.trim()).length === 0) {
      toast.error('Please fill in name, purpose, and at least one fact');
      return;
    }

    setGenerating(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/generate-affidavit`, {
        ...formData,
        facts: facts.filter(f => f.trim())
      }, {  });

      setGeneratedText(data.affidavit_text);
      setEditedText(data.affidavit_text);
      toast.success('Affidavit generated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate affidavit');
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const text = editedText || generatedText;
    
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('AFFIDAVIT', 105, 16, { align: 'center' });
    
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    
    const lines = doc.splitTextToSize(text, 180);
    let y = 35;
    lines.forEach(line => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 15, y);
      y += 5;
    });

    doc.save(`Affidavit-${formData.affiant_name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" data-testid="affidavit-page">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-slate-900" data-testid="affidavit-title">Affidavit Generator</h1>
          <p className="text-sm text-slate-500 mt-1">Generate a legally formatted affidavit. Edit before downloading.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6" data-testid="affidavit-form">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name (Affiant)</label>
                <input
                  type="text"
                  value={formData.affiant_name}
                  onChange={(e) => setFormData({ ...formData, affiant_name: e.target.value })}
                  className="w-full border-2 border-slate-200 focus:border-slate-800 rounded-lg p-3 outline-none transition-colors text-slate-900"
                  placeholder="Enter your full legal name"
                  data-testid="affiant-name-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.affiant_address}
                  onChange={(e) => setFormData({ ...formData, affiant_address: e.target.value })}
                  className="w-full border-2 border-slate-200 focus:border-slate-800 rounded-lg p-3 outline-none transition-colors text-slate-900"
                  placeholder="Full residential address"
                  data-testid="affiant-address-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Purpose of Affidavit</label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full border-2 border-slate-200 focus:border-slate-800 rounded-lg p-3 outline-none transition-colors text-slate-900"
                  placeholder="e.g., Name change, property transfer, general"
                  data-testid="purpose-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Court Name (optional)</label>
                  <input
                    type="text"
                    value={formData.court_name}
                    onChange={(e) => setFormData({ ...formData, court_name: e.target.value })}
                    className="w-full border-2 border-slate-200 focus:border-slate-800 rounded-lg p-3 outline-none transition-colors text-slate-900"
                    placeholder="Court name"
                    data-testid="court-name-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Case Number (optional)</label>
                  <input
                    type="text"
                    value={formData.case_number}
                    onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                    className="w-full border-2 border-slate-200 focus:border-slate-800 rounded-lg p-3 outline-none transition-colors text-slate-900"
                    placeholder="Case number"
                    data-testid="case-number-input"
                  />
                </div>
              </div>

              {/* Facts */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Facts (Statements)</label>
                <div className="space-y-2">
                  {facts.map((fact, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-sm text-slate-400 mt-3 w-6">{i + 1}.</span>
                      <input
                        type="text"
                        value={fact}
                        onChange={(e) => updateFact(i, e.target.value)}
                        className="flex-1 border-2 border-slate-200 focus:border-slate-800 rounded-lg p-2.5 outline-none transition-colors text-sm text-slate-900"
                        placeholder={`Fact ${i + 1}...`}
                        data-testid={`fact-input-${i}`}
                      />
                      {facts.length > 1 && (
                        <button onClick={() => removeFact(i)} className="text-slate-400 hover:text-red-500" data-testid={`remove-fact-${i}`}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addFact}
                  className="mt-2 text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1 font-medium"
                  data-testid="add-fact-btn"
                >
                  <Plus className="w-4 h-4" /> Add Fact
                </button>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                data-testid="generate-affidavit-btn"
              >
                {generating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><FileText className="w-4 h-4" /> Generate Affidavit</>
                )}
              </button>
            </div>
          </div>

          {/* Preview / Edit */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6" data-testid="affidavit-preview">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Eye className="w-5 h-5" /> Preview & Edit
              </h2>
              {editedText && (
                <button
                  onClick={downloadPDF}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-1"
                  data-testid="download-affidavit-pdf"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              )}
            </div>
            {editedText ? (
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full h-[500px] border-2 border-slate-200 focus:border-slate-800 rounded-lg p-4 outline-none transition-colors text-sm text-slate-800 font-mono leading-relaxed resize-none"
                data-testid="affidavit-editor"
              />
            ) : (
              <div className="flex items-center justify-center h-[400px] text-slate-400 text-sm">
                Generated affidavit will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffidavitBuilder;
