import { mdiChartTimelineVariant, mdiUpload } from '@mdi/js';
import Head from 'next/head';
import React, { ReactElement, useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.min.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';

import CardBox from '../../components/CardBox';
import LayoutAuthenticated from '../../layouts/Authenticated';
import SectionMain from '../../components/SectionMain';
import SectionTitleLineWithButton from '../../components/SectionTitleLineWithButton';
import { getPageTitle } from '../../config';

import { Field, Form, Formik } from 'formik';
import FormField from '../../components/FormField';
import BaseDivider from '../../components/BaseDivider';
import BaseButtons from '../../components/BaseButtons';
import BaseButton from '../../components/BaseButton';
import FormCheckRadio from '../../components/FormCheckRadio';
import FormCheckRadioGroup from '../../components/FormCheckRadioGroup';
import FormFilePicker from '../../components/FormFilePicker';
import FormImagePicker from '../../components/FormImagePicker';
import { SelectField } from '../../components/SelectField';
import { SelectFieldMany } from '../../components/SelectFieldMany';
import { SwitchField } from '../../components/SwitchField';
import { RichTextField } from '../../components/RichTextField';

import { update, fetch } from '../../stores/chats/chatsSlice';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { useRouter } from 'next/router';
import { saveFile } from '../../helpers/fileSaver';
import dataFormatter from '../../helpers/dataFormatter';
import ImageField from '../../components/ImageField';

const EditChats = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const initVals = {
    sender: '',

    receiver: '',

    date: new Date(),

    block: false,

    message: '',
  };
  const [initialValues, setInitialValues] = useState(initVals);

  const { chats } = useAppSelector((state) => state.chats);

  const { chatsId } = router.query;

  useEffect(() => {
    dispatch(fetch({ id: chatsId }));
  }, [chatsId]);

  useEffect(() => {
    if (typeof chats === 'object') {
      setInitialValues(chats);
    }
  }, [chats]);

  useEffect(() => {
    if (typeof chats === 'object') {
      const newInitialVal = { ...initVals };

      Object.keys(initVals).forEach(
        (el) => (newInitialVal[el] = chats[el] || ''),
      );

      setInitialValues(newInitialVal);
    }
  }, [chats]);

  const handleSubmit = async (data) => {
    await dispatch(update({ id: chatsId, data }));
    await router.push('/chats/chats-list');
  };

  return (
    <>
      <Head>
        <title>{getPageTitle('Edit chats')}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiChartTimelineVariant}
          title={'Edit chats'}
          main
        >
          {''}
        </SectionTitleLineWithButton>
        <CardBox>
          <Formik
            enableReinitialize
            initialValues={initialValues}
            onSubmit={(values) => handleSubmit(values)}
          >
            <Form>
              <FormField label='Sender'>
                <Field name='sender' placeholder='Sender' />
              </FormField>

              <FormField label='Receiver'>
                <Field name='receiver' placeholder='Receiver' />
              </FormField>

              <FormField label='Date'>
                <DatePicker
                  dateFormat='yyyy-MM-dd hh:mm'
                  showTimeSelect
                  selected={
                    initialValues.date
                      ? new Date(
                          dayjs(initialValues.date).format('YYYY-MM-DD hh:mm'),
                        )
                      : null
                  }
                  onChange={(date) =>
                    setInitialValues({ ...initialValues, date: date })
                  }
                />
              </FormField>

              <FormField label='Block' labelFor='block'>
                <Field name='block' id='block' component={SwitchField}></Field>
              </FormField>

              <FormField label='Message'>
                <Field name='message' placeholder='Message' />
              </FormField>

              <BaseDivider />
              <BaseButtons>
                <BaseButton type='submit' color='info' label='Submit' />
                <BaseButton type='reset' color='info' outline label='Reset' />
                <BaseButton
                  type='reset'
                  color='danger'
                  outline
                  label='Cancel'
                  onClick={() => router.push('/chats/chats-list')}
                />
              </BaseButtons>
            </Form>
          </Formik>
        </CardBox>
      </SectionMain>
    </>
  );
};

EditChats.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutAuthenticated permission={'UPDATE_CHATS'}>
      {page}
    </LayoutAuthenticated>
  );
};

export default EditChats;
