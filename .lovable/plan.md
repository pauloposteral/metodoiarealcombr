## Ocultar dica "Ctrl+K" no mobile

O toast "Dica: Ctrl K para navegar rápido" aparece sobrepondo o header no mobile (atalho de teclado que não faz sentido em touch).

### Alteração
- Em `src/components/landing/LandingV2Wow8.tsx`, no componente `KeyboardHint`: detectar viewport e não renderizar em telas < 768px (ou checar `matchMedia('(pointer: coarse)')` para pular em qualquer dispositivo touch).

Sem outras mudanças.