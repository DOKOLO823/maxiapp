// src/components/form/AudioForm.tsx
import React, { FC, useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppView from '@components/AppView';
import CategorySelector from '@components/CategorySelector';
import FileSelector, { FileDataCompatible } from '@components/FileSelector';
import AppButton from '@ui/AppButton';
import Progress from '@ui/Progress';
import { categories } from '@utils/categories';
import colors from '@utils/colors';
import { useDispatch } from 'react-redux';
import { upldateNotification } from 'src/store/notification';
import catchAsyncError from 'src/api/catchError';
import * as yup from 'yup';

interface FormFields {
  title: string;
  category: string;
  about: string;
  file?: FileDataCompatible;
  poster?: FileDataCompatible;
}

const defaultForm: FormFields = {
  title: '',
  category: '',
  about: '',
  file: undefined,
  poster: undefined,
};

const commonSchema = {
  title: yup.string().trim().required('Title is missing!'),
  category: yup.string().oneOf(categories, 'Category is missing!').required(),
  about: yup.string().trim().required('About is missing!'),
  poster: yup.object().shape({
    uri: yup.string(),
    name: yup.string(),
    type: yup.string(),
    size: yup.number(),
  }),
};

const newAudioSchema = yup.object().shape({
  ...commonSchema,
  file: yup.object().shape({
    uri: yup.string().required('Audio file is missing!'),
    name: yup.string().required('Audio file is missing!'),
    type: yup.string().required('Audio file is missing!'),
    size: yup.number().required('Audio file is missing!'),
  }),
});

const oldAudioSchema = yup.object().shape({
  ...commonSchema,
});

interface Props {
  initialValues?: { title: string; category: string; about: string };
  onSubmit(formData: FormData): void;
  progress?: number;
  busy?: boolean;
}

const AudioForm: FC<Props> = ({ initialValues, progress = 0, busy, onSubmit }) => {
  const [audioInfo, setAudioInfo] = useState<FormFields>({ ...defaultForm });
  const [isForUpdate, setIsForUpdate] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (initialValues) {
      setAudioInfo({ ...initialValues });
      setIsForUpdate(true);
    }
  }, [initialValues]);

  const handleCategorySelect = (item: string) => {
    setAudioInfo({ ...audioInfo, category: item });
    setShowCategoryModal(false);
  };

  const handleSubmit = async () => {
    try {
      let finalData;
      if (isForUpdate) finalData = await oldAudioSchema.validate(audioInfo, { abortEarly: false });
      else finalData = await newAudioSchema.validate(audioInfo, { abortEarly: false });

      const formData = new FormData();
      formData.append('title', finalData.title);
      formData.append('about', finalData.about);
      formData.append('category', finalData.category);

      // Ajouter poster si présent
      if (finalData.poster?.uri) {
        formData.append('poster', {
          uri: finalData.poster.uri, // NE PAS retirer file://
          type: finalData.poster.type || 'image/jpeg',
          name: finalData.poster.name || `poster-${Date.now()}.jpg`,
        } as any);
      }

      // Ajouter audio si présent et non update
      if (!isForUpdate && finalData.file?.uri) {
        formData.append('file', {
          uri: finalData.file.uri, // NE PAS retirer file://
          type: finalData.file.type || 'audio/mpeg',
          name: finalData.file.name || `audio-${Date.now()}.mp3`,
        } as any);
      }

      // Envoyer le FormData
      onSubmit(formData);
    } catch (error: any) {
      const errorMessage = catchAsyncError(error);
      dispatch(upldateNotification({ message: errorMessage, type: 'error' }));
    }
  };

  return (
    <AppView>
      <ScrollView style={styles.container}>
        <View style={styles.fileSelctorContainer}>
          <FileSelector
            icon={<MaterialComIcon name="image-outline" size={35} color={colors.SECONDARY} />}
            btnTitle="Select Poster"
            mediaType="photo"
            onSelect={poster => setAudioInfo({ ...audioInfo, poster })}
          />
          {!isForUpdate && (
            <FileSelector
              icon={<MaterialComIcon name="file-music-outline" size={35} color={colors.SECONDARY} />}
              btnTitle="Select Audio"
              style={{ marginLeft: 20 }}
              mediaType="audio"
              onSelect={file => setAudioInfo({ ...audioInfo, file })}
            />
          )}
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor={colors.INACTIVE_CONTRAST}
            value={audioInfo.title}
            onChangeText={text => setAudioInfo({ ...audioInfo, title: text })}
          />
          <Pressable onPress={() => setShowCategoryModal(true)} style={styles.categorySelector}>
            <Text style={styles.categorySelectorTitle}>Category</Text>
            <Text style={styles.selectedCategory}>{audioInfo.category || 'Select Category'}</Text>
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="About"
            placeholderTextColor={colors.INACTIVE_CONTRAST}
            value={audioInfo.about}
            onChangeText={text => setAudioInfo({ ...audioInfo, about: text })}
            multiline
            numberOfLines={10}
          />
          <CategorySelector
            visible={showCategoryModal}
            onRequestClose={() => setShowCategoryModal(false)}
            title="Category"
            data={categories}
            renderItem={item => <Text style={styles.category}>{item}</Text>}
            onSelect={handleCategorySelect}
          />
          {busy && <Progress progress={progress} />}
          <AppButton
            title={isForUpdate ? 'Update' : 'Submit'}
            busy={busy}
            onPress={handleSubmit}
            borderRadius={7}
          />
        </View>
      </ScrollView>
    </AppView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  fileSelctorContainer: { flexDirection: 'row' },
  formContainer: { marginTop: 20 },
  input: {
    borderWidth: 2,
    borderColor: colors.SECONDARY,
    borderRadius: 7,
    padding: 10,
    fontSize: 18,
    color: colors.CONTRAST,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 2,
    borderColor: colors.SECONDARY,
    borderRadius: 7,
    padding: 10,
  },
  categorySelectorTitle: { color: colors.CONTRAST },
  selectedCategory: { color: colors.SECONDARY, fontStyle: 'italic', fontWeight: 'bold' },
  category: { padding: 10, color: colors.PRIMARY },
});

export default AudioForm;
