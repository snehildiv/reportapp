import jsPDF from 'jspdf';
import axios from 'axios';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

import { firebaseConfig } from './firebaseConfig';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

interface Report {
  id: string;
  fileName: string;
  code: string;
  executionResult: string;
}

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
  };

  const generateReport = async () => {
    const reportPromises = files.map(async (file) => {
      const code = await readFile(file);
      const executionResult = await executeCode(code);

      return {
        id: uuidv4(),
        fileName: file.name,
        code,
        executionResult,
      };
    });

    const generatedReports = await Promise.all(reportPromises);
    setReports(generatedReports);

    // Store the reports in Firebase Firestore
    generatedReports.forEach((report) => {
      firestore.collection('reports').doc(report.id).set(report);
    });
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const executeCode = async (code: string): Promise<string> => {
    // Make an API call to execute the code using Piston API or any other similar service
    // Return the execution result as a string
    // You can use Axios for making API requests
    // Example using Axios:
    const response = await axios.post('https://piston-api.example.com/execute', { code });
    return response.data;
  };

  const downloadReport = (report: Report) => {
    // Convert report data into PDF format and initiate download
    // You can use a library like jsPDF or pdfmake for generating PDFs
    // Example: jsPDF implementation
    const doc = new jsPDF();
    doc.text(`File: ${report.fileName}`, 10, 10);
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, 10, 20);
    doc.text(`Code:\n${report.code}`, 10, 30);
    doc.text(`Execution Result:\n${report.executionResult}`, 10, 50);
    doc.save(`${report.fileName}_report.pdf`);
  };

  return (
    <div>
      <header>
        <img src="C:\Users\divya\code-report-app\src\logo.jpeg" alt="Logo" />
      </header>
      <input type="file" multiple onChange={handleFileUpload} />
      <button onClick={generateReport}>Generate Report</button>
      <table>
        <thead>
          <tr>
            <th>File Name</th>
            <th>Report</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{report.fileName}</td>
              <td>{report.executionResult}</td>
              <td>
                <button onClick={() => downloadReport(report)}>Download</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
