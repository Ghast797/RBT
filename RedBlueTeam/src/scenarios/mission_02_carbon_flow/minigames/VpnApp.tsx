import { VpnRouter } from '../../../engine/blocks/VpnRouter';

/**
 * Re-export wspólnego klocka VpnRouter z silnika pod nazwą VpnApp dla zgodności wstecznej.
 * Cała logika i szata graficzna zostały przeniesione do src/engine/blocks/VpnRouter.tsx.
 */
export const VpnApp = VpnRouter;
export default VpnApp;
