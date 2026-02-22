import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { documentsApi } from '../services/documents';

export function useDocumentList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => documentsApi.list(params),
  });
}

export function useDocumentDetail(id: string) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentsApi.getById(id),
    enabled: !!id,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: documentsApi.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      message.success('Document uploaded');
    },
    onError: (err: any) => message.error(err?.message || 'Upload failed'),
  });
}

export function useExtractDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: documentsApi.extract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      message.success('Fields extracted');
    },
    onError: (err: any) => message.error(err?.message || 'Extraction failed'),
  });
}

export function useMatchDocuments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: documentsApi.match,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      message.success('Triple match completed');
    },
    onError: (err: any) => message.error(err?.message || 'Match failed'),
  });
}
