import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-wysiwyg';
import { DicomMetadataStore } from '@ohif/core'; // Adjust import path as needed
import axios from 'axios';
import DOMPurify from 'dompurify'; // For sanitizing HTML content
import './Report.css'; // Import the CSS file

const Report = ({ onClose, PatientInfo, closeButton }) => {
  const [html, setHtml] = useState(''); // Initial editor content
  const [templates, setTemplates] = useState([]); // For dropdown options
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [studyUID, setStudyUID] = useState(''); // To track the current studyUID
  const [loading, setLoading] = useState(false); // To handle loading states
  const [error, setError] = useState(null); // To handle errors
  const [isEdited, setIsEdited] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  useEffect(() => {
    fetchDicomMetadata(); // Fetch StudyUID when the component mounts
    fetchTemplates(); // Fetch templates
  }, []);

  useEffect(() => {
    if (studyUID) {
      loadReport(); // Load report content if a studyUID is available
    }
  }, [studyUID]);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(
        'http://35.157.184.183/radshare-appapi/api/radshareopenapi/getPublicReportTemplate/MR'
      );
      setTemplates(response.data.ReportData || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to load templates.');
    }
  };

  const fetchDicomMetadata = () => {
    const studyUIDs = DicomMetadataStore.getStudyInstanceUIDs();
    if (studyUIDs.length > 0) {
      setStudyUID(studyUIDs[0]); // Use the first studyUID as an example
    } else {
      console.error('No Study Instance UIDs found.');
      setError('No Study Instance UIDs available.');
    }
  };

  const loadReport = async () => {
    setLoading(true);
    setError(null);

    try {
      // Retrieve content from localStorage specific to the studyUID
      const savedContent = localStorage.getItem(`editorContent_${studyUID}`);
      if (savedContent) {
        setHtml(savedContent); // Load saved content for this studyUID
        console.log('Loaded content from localStorage for studyUID:', studyUID);
      } else {
        // If no saved content exists, proceed with the API call
        const response = await axios.get(
          `http://35.157.184.183/radshare-appapi/api/radshareopenapi/getStudyiuidinfo/${studyUID}`
        );

        if (response.data?.status === 'S' && response.data.ReportContent) {
          setHtml(response.data.ReportContent); // Load content from API
          console.log('Report loaded successfully:', studyUID);
        } else {
          console.log('No saved report found for the given StudyUID');
          setHtml(''); // Clear editor if no report is found
        }
      }
    } catch (error) {
      console.error('Error loading report:', error);
      setError('Failed to load report content.');
    }
    setLoading(false);
  };
  const saveReport = async () => {
    if (!studyUID) {
      alert('Study UID is not available. Cannot save report.');
      return;
    }

    try {
      // Construct the JSON payload
      const jsonPayload = {
        report: html, // Editor content
        STUDYINSTANCEUID: studyUID, // Study UID
      };

      // Sending POST request with JSON
      const response = await axios.post(
        'http://3.77.246.193/radshare-appapi/api/radshareopenapi/saveEditorOpenReport',
        jsonPayload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Full API Response:', response);

      if (response.data?.includes('Data Received Successfully')) {
        alert('Report saved successfully!');
        setIsSaved(true);
        setIsEdited(false);
        localStorage.removeItem('hasUnsavedChanges');
        onClose();
      } else {
        alert('Failed to save report. Please try again.');
      }
    } catch (error) {
      console.error('Error saving report:', error);
      if (error.response) {
        console.error('Error Response Data:', error.response.data);
        console.error('Error Response Status:', error.response.status);
      }
      alert('Failed to save report due to a network or server error.');
    }
  };

  const handleLoadTemplate = templateId => {
    const selected = templates.find(template => template.id === templateId);
    if (selected) {
      setHtml(selected.content); // Load template content into editor
      setSelectedTemplate(templateId);
      setIsEdited(true);
    } else {
      console.error('Template not found!');
    }
  };

  const onChange = newHtml => {
    try {
      const content = typeof newHtml === 'string' ? newHtml : newHtml.target?.value || '';
      const sanitizedHtml = DOMPurify.sanitize(content); // Sanitize HTML content
      localStorage.setItem(`editorContent_${studyUID}`, sanitizedHtml); // Save with studyUID key
      setHtml(sanitizedHtml); // Safely update editor content
      setIsEdited(true);
    } catch (error) {
      console.error('Error updating editor content:', error);
    }
  };

  const handleGoBack = () => {
    if (isEdited && !isSaved) {
      // Store true if there are unsaved changes
      localStorage.setItem('hasUnsavedChanges', JSON.stringify(true));
    } else {
      // Clear the state if there are no unsaved changes
      localStorage.setItem('hasUnsavedChanges', JSON.stringify(false));
    }

    onClose(); // Proceed with the navigation
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div
      className="editor-container absolute top-0 left-0 right-0 bottom-0 h-full w-full">
      <h1>Report Editor</h1>
      <div className="button-container">
        <button onClick={handleGoBack}>Go Back</button>
      </div>
      {/* Patient Details */}

      <div className="patient-info-container">
        <h2>Patient Details</h2>
        <div className="patient-info-grid">
          <div className="patient-info-row">
            <span className="info-label">Patient Name:</span>
            <span className="info-value">{PatientInfo.patientName}</span>
          </div>
          <div className="patient-info-row">
            <span className="info-label">Patient ID:</span>
            <span className="info-value">{PatientInfo.patientID}</span>
          </div>
          <div className="patient-info-row">
            <span className="info-label">Patient Age:</span>
            <span className="info-value">{PatientInfo.patientAge}</span>
          </div>
          <div className="patient-info-row">
            <span className="info-label">Patient Sex:</span>
            <span className="info-value">{PatientInfo.patientSex}</span>
          </div>
          <div className="patient-info-row">
            <span className="info-label">Procedure Date:</span>
            <span className="info-value">{PatientInfo.performedProcedureStepStartDate}</span>
          </div>
          <div className="patient-info-row">
            <span className="info-label">Study Description:</span>
            <span className="info-value">{PatientInfo.studyDescription}</span>
          </div>
        </div>
      </div>

      {/* Dropdown for selecting and loading templates */}
      <div className="template-dropdown">
        <label htmlFor="templateDropdown">Load Template: </label>
        <select
          id="templateDropdown"
          value={selectedTemplate}
          onChange={e => handleLoadTemplate(e.target.value)}
        >
          <option value="">Select a template</option>
          {templates.map(template => (
            <option
              key={template.id}
              value={template.id}
            >
              {template.name}
            </option>
          ))}
        </select>
      </div>

      {/* WYSIWYG Editor */}
      <div className="editor-wrapper">
        <Editor
          value={html}
          onChange={onChange}
          style={{
            color: '#212529', // Dark gray for text
            backgroundColor: '#ffffff', // White background
            padding: '10px',
          }}
        />
      </div>

      {/* Save/Confirm Button */}
      <div className="button-container">
        <button onClick={saveReport}>Save/Confirm</button>
        {/* <button onClick={handleGoBack}>Go Back</button> */}
      </div>
    </div>
  );
};

export default Report;
