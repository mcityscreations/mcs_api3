// src/common/utils/isWebClient.utils.ts
export function isWebClient(clientPlatform: string): boolean {
    return clientPlatform == 'web' ? true : false;
}