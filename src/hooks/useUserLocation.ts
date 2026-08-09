import { useState, useCallback, useEffect } from 'react';
import { UserLocationState } from '../types/cafeteria';

/**
 * HOOK CUSTOMIZADO: useUserLocation
 * 
 * Gerencia a solicitação de permissões de localização do GPS e o rastreamento real das coordenadas.
 * Mantém o estado estritamente null caso o sinal de GPS não esteja disponível ou a permissão seja negada.
 */
export function useUserLocation() {
  const [locationState, setLocationState] = useState<UserLocationState>({
    latitude: null,
    longitude: null,
    precisaoMetros: null,
    statusPermissao: 'undetermined',
    carregando: false,
    erroMensagem: null
  });

  /**
   * Solicita a permissão de localização do usuário (Foreground)
   */
  const solicitarPermissao = useCallback(() => {
    setLocationState(prev => ({
      ...prev,
      carregando: true,
      statusPermissao: 'requesting',
      erroMensagem: null
    }));

    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setLocationState({
        latitude: null,
        longitude: null,
        precisaoMetros: null,
        statusPermissao: 'denied',
        carregando: false,
        erroMensagem: 'Geolocalização não é suportada por este dispositivo/navegador.'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          precisaoMetros: Math.round(position.coords.accuracy),
          statusPermissao: 'granted',
          carregando: false,
          erroMensagem: null
        });
      },
      (error) => {
        let msg = 'Permissão de localização necessária. Ative o GPS no seu navegador ou dispositivo.';
        if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Sinal de GPS indisponível no momento. Verifique sua conexão e tente novamente.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Tempo limite esgotado ao buscar localização do GPS.';
        }

        setLocationState({
          latitude: null,
          longitude: null,
          precisaoMetros: null,
          statusPermissao: 'denied',
          carregando: false,
          erroMensagem: msg
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  // Tenta obter permissão inicial ao carregar o componente
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted' || result.state === 'prompt') {
          solicitarPermissao();
        }
      }).catch(() => {
        solicitarPermissao();
      });
    }
  }, [solicitarPermissao]);

  return {
    ...locationState,
    solicitarPermissao
  };
}
