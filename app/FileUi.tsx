import Aquafier, { FileObject, reorderAquaTreeRevisionsProperties } from "aqua-js-sdk/react-native";
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type SelectedFile = {
  name: string;
  uri: string;
  type: string | null;
  size: number | null;
};

export default function FileUi() {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [aquaData, setAquaData] = useState<string | null>(null);

  const openFilePicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: '*/*',
      });

      if (!result.canceled) {
        const file = result.assets && result.assets[0];
        if (file) {
          setSelectedFile({
            name: file.name,
            uri: file.uri,
            type: file.mimeType ?? null,
            size: file.size ?? null,
          });


          let fileObject: FileObject = {
            fileContent: "",
            fileName: file.name,
            path: file.uri,
            fileSize: file.size

          }
          let aquafier = new Aquafier();
          let res = await aquafier.createGenesisRevision(fileObject)
          if (res.isErr()) {
            const err = JSON.stringify(res.data, null, 4)
            console.log(err)  
            Alert.alert('Error Gernerating Aqua json', `File name: ${err}`);
          } else {
            let orderedAquaTree = reorderAquaTreeRevisionsProperties(res.data.aquaTree!!)
            // Format the JSON with proper indentation for display
            let data = JSON.stringify(orderedAquaTree, null, 1)
            setAquaData(data)
          }
        }
      } else {
        console.log('User canceled');
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  return (
    <View style={styles.container}>
      {
        !selectedFile && (
          <><Text style={styles.title}>Select a file to generate Aqua JSON</Text><TouchableOpacity style={styles.button} onPress={openFilePicker}>
            <Text style={styles.buttonText}>Open File Picker</Text>
          </TouchableOpacity></>
        )
      }
     


      {selectedFile && (
        <View style={styles.fileInfo}>
          <Text style={styles.fileInfoTitle}>Selected File:</Text>
          <Text style={styles.fileName}>Name: {selectedFile.name}</Text>
          <Text style={styles.fileDetails}>Type: {selectedFile.type}</Text>
          <Text style={styles.fileDetails}>Size: {selectedFile.size} bytes</Text>
          
        </View>
      )}


      {aquaData && (
        <View style={styles.fileInfo}>
          <Text style={styles.fileInfoTitle}>Aqua JSON:</Text>
          <ScrollView style={styles.scrollContainer} nestedScrollEnabled={true}>
      <Text style={styles.jsonText}>{aquaData}</Text>
    </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  fileInfo: {
    marginTop: 30,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    width: '100%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  fileInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 5,
  },
  fileDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  jsonScrollView: {
    maxHeight: 300,
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    padding: 8,
    marginTop: 10,
  },
  jsonText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
  aquaTree: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  scrollContainer: {
    maxHeight: 650, // Adjust this height as needed
    backgroundColor: '#f5f5f5', // Optional: add background color
    borderRadius: 5, // Optional: add border radius
    padding: 10, // Optional: add padding
  },
});

// FileUi is already exported as default above