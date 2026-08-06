import { useState, useCallback, useEffect } from 'react';
import { UserLocationState, PermissionStatus } from '../types/cafeteria';

/**
 * HOOK CUSTOMIZADO: useUserLocation
 * 
 * Gerencia a solicitação de permissões de localização (Foreground) e o rastreamento das coordenadas do usuário.
 * 
 * NOTA DE ARQUITETURA REACT NATIVE (Expo vs CLI):
 * ===============================================
 * No React Native com Expo (expo-location):
 * ```ts
 * import * as Location from 'expo-location';
 * 
 * const requestNativeLocation = async () => {
 *   let { status } = await Location.requestForegroundPermissionsAsync();
 *   if (status !== 'granted') {
 *     // Trata permissão negada pelo usuário
 *     return;
 *   }
 *   let location = await Location.getCurrentPositionAsync({
 *     accuracy: Location.Accuracy.High
 *   });
 *   setCoords({ lat: location.coords.latitude, lng: location.coords.longitude });
 * };
 * ```
 * 
 * No React Native CLI (@react-native-community/geolocation):
 * ```ts
 * import Geolocation from '@react-native-community/geolocation';
 * import { PermissionsAndroid, Platform } from 'react-native';
 * 
 * const requestAndroidPermission = async () => {
 *   if (Platform.OS === 'android') {
 *     const granted = await PermissionsAndroid.request(
 *       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
 *     );
 *     return granted === PermissionsAndroid.RESULTS.GRANTED;
 *   }
 *   return true; // iOS solicita via Geolocation.requestAuthorization()
 * };
 * ```
 */

// Coordenadas de Fallback Padrão (São Paulo e Curitiba para testes)
const SAO_PAULO_CENTER = {
  lat: -23.5615,
  lng: -46.6560
};

// Fallback do Requisito 2: Curitiba - PR
const CURITIBA_FALLBACK = {
  lat: -25.4284,
  lng: -49.2733
};

export function useUserLocation() {
  const [locationState, setLocationState] = useState<UserLocationState>({
    latitude: CURITIBA_FALLBACK.lat, // Inicia com fallback de Curitiba conforme solicitado
    longitude: CURITIBA_FALLBACK.lng,
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

    if (!('geolocation' in navigator)) {
      setLocationState(prev => ({
        ...prev,
        carregando: false,
        statusPermissao: 'denied',
        erroMensagem: 'Geolocalização não é suportada por este dispositivo/navegador.'
      }));
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
        let msg = 'Permissão de localização negada pelo usuário.';
        if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Sinal de GPS indisponível no momento.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Tempo limite esgotado ao buscar localização GPS.';
        }

        setLocationState(prev => ({
          ...prev,
          carregando: false,
          statusPermissao: 'denied',
          erroMensagem: msg
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  /**
   * Simula a recusa de permissão para testes de UI
   */
  const simularPermissaoNegada = useCallback(() => {
    setLocationState({
      latitude: CURITIBA_FALLBACK.lat,
      longitude: CURITIBA_FALLBACK.lng,
      precisaoMetros: null,
      statusPermissao: 'denied',
      carregando: false,
      erroMensagem: 'Permissão de localização negada pelo usuário (Modo de Teste Simulado).'
    });
  }, []);

  /**
   * Restaura ou fixa uma localização simulada em Curitiba (Requisito 2: Fallback de Curitiba -25.4284, -49.2733)
   */
  const simularLocalizacaoCuritiba = useCallback(() => {
    setLocationState({
      latitude: CURITIBA_FALLBACK.lat,
      longitude: CURITIBA_FALLBACK.lng,
      precisaoMetros: 10,
      statusPermissao: 'granted',
      carregando: false,
      erroMensagem: null
    });
  }, []);

  /**
   * Restaura ou fixa uma localização simulada em São Paulo (Av. Paulista / Jardins)
   */
  const simularLocalizacaoSaoPaulo = useCallback(() => {
    setLocationState({
      latitude: SAO_PAULO_CENTER.lat,
      longitude: SAO_PAULO_CENTER.lng,
      precisaoMetros: 15,
      statusPermissao: 'granted',
      carregando: false,
      erroMensagem: null
    });
  }, []);

  // Tenta obter permissão inicial silenciosamente ao carregar o componente
  useEffect(() => {
    // Se o navegador já permitir, atualiza suavemente
    if ('geolocation' in navigator) {
      navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          solicitarPermissao();
        }
      }).catch(() => {
        // Ignora erros de permissão de query no iframe
      });
    }
  }, [solicitarPermissao]);

  return {
    ...locationState,
    solicitarPermissao,
    simularPermissaoNegada,
    simularLocalizacaoCuritiba,
    simularLocalizacaoSaoPaulo
  };
}
