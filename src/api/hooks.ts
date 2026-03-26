import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getAvailableProtocolsRequest,
  listFilesRequest,
  loginRequest,
  registerRequest,
  uploadFilesRequest,
  type AuthRequest,
  type Protocol,
} from "@/api/client"
import { useAuthStore } from "@/stores/auth-store"

export const queryKeys = {
  protocols: ["protocols"] as const,
  files: (protocols: Protocol[]) => ["files", ...protocols] as const,
}

export function useLoginMutation() {
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (payload: AuthRequest) => loginRequest(payload),
    onSuccess: (data, variables) => {
      if (data.token) {
        setSession(data.token, variables.username ?? "usuario")
      }
    },
  })
}

export function useRegisterMutation() {
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (payload: AuthRequest) => registerRequest(payload),
    onSuccess: (data, variables) => {
      if (data.token) {
        setSession(data.token, variables.username ?? "usuario")
      }
    },
  })
}

export function useProtocolsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.protocols,
    queryFn: getAvailableProtocolsRequest,
    enabled,
  })
}

export function useFilesQuery(protocols: Protocol[], enabled = true) {
  return useQuery({
    queryKey: queryKeys.files(protocols),
    queryFn: () => listFilesRequest(protocols),
    enabled: enabled && protocols.length > 0,
  })
}

export function useUploadFilesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      files,
      protocols,
    }: {
      files: File[]
      protocols: Protocol[]
    }) => uploadFilesRequest(files, protocols),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.protocols })
      void queryClient.invalidateQueries({ queryKey: ["files"] })
    },
  })
}
