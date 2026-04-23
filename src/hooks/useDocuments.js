// src/hooks/useDocuments.js
import { useState, useEffect, useCallback } from "react";
import {
  listenToBarangayDocs, listenToAllDocs,
  updateDocumentStatus, deleteDocumentRecord,
  uploadDocumentRecord, addActivityLog,
} from "../firebase/firestoreService.js";
import { uploadFile, deleteFile } from "../firebase/storageService.js";
import { generateDocumentName } from "../utils/helpers.js";

export const useDocuments = (isAdmin, barangayId, userProfile) => {
  const [documents, setDocuments] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    let unsubscribe;

    if (isAdmin) {
      unsubscribe = listenToAllDocs((docs) => {
        setDocuments(docs);
        setLoading(false);
      });
    } else if (barangayId) {
      unsubscribe = listenToBarangayDocs(barangayId, (docs) => {
        setDocuments(docs);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return () => unsubscribe && unsubscribe();
  }, [isAdmin, barangayId]);

  // Upload document
  const uploadDocument = useCallback(
    async (file, category, description, onProgress) => {
      const autoName = generateDocumentName(
        userProfile?.barangayName || "BARANGAY",
        category,
        file.name
      );

      const { url, path } = await uploadFile(
        file, barangayId, category, onProgress
      );

      const docId = await uploadDocumentRecord({
        fileName:      autoName,
        originalName:  file.name,
        fileUrl:       url,
        filePath:      path,
        fileSize:      file.size,
        fileType:      file.type,
        category,
        description,
        barangayId,
        barangayName:  userProfile?.barangayName,
        uploadedBy:    userProfile?.displayName,
        uploadedById:  userProfile?.id,
      });

      await addActivityLog({
        action:       "UPLOAD",
        description:  `Uploaded document: ${autoName}`,
        barangayId,
        barangayName: userProfile?.barangayName,
        userId:       userProfile?.id,
        userName:     userProfile?.displayName,
        documentId:   docId,
      });

      return docId;
    },
    [barangayId, userProfile]
  );

  // Update status
  const changeStatus = useCallback(
    async (docId, newStatus, reviewNote, document) => {
      await updateDocumentStatus(docId, newStatus, reviewNote, userProfile?.displayName || "");

      await addActivityLog({
        action:       "STATUS_CHANGE",
        description:  `Changed status of "${document.fileName}" to ${newStatus}`,
        barangayId:   document.barangayId,
        barangayName: document.barangayName,
        userId:       userProfile?.id,
        userName:     userProfile?.displayName,
        documentId:   docId,
      });
    },
    [userProfile]
  );

  // Delete document
  const removeDocument = useCallback(
    async (document) => {
      await deleteFile(document.filePath);
      await deleteDocumentRecord(document.id);

      await addActivityLog({
        action:       "DELETE",
        description:  `Deleted document: ${document.fileName}`,
        barangayId:   document.barangayId,
        barangayName: document.barangayName,
        userId:       userProfile?.id,
        userName:     userProfile?.displayName,
      });
    },
    [userProfile]
  );

  return { documents, loading, uploadDocument, changeStatus, removeDocument };
};