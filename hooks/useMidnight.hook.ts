import { useCallback, useState } from "react";

/** Resultado genérico que debería devolver tu binding al preparar una llamada. */
export type PrepareCallResult<Tx = unknown, Private = unknown> = {
  tx: Tx;
  privateData?: Private;
};

/** Interfaz "amplia" para no acoplarse a una sola versión del wallet SDK. */
export interface WalletLike {
  // Ejemplo en versiones nuevas (nombres ilustrativos)
  signAndSubmit?: (tx: unknown, opts?: { privateData?: unknown }) => Promise<{ txId?: string }>;

  // Algunas versiones exponen 'submit'
  submit?: (tx: unknown, opts?: { privateData?: unknown }) => Promise<{ txId?: string }>;

  // Ruta de bajo nivel: firmar y postear por separado
  sign?: (tx: unknown) => Promise<unknown>;
  post?: (signed: unknown) => Promise<{ txId?: string }>;
}

/**
 * Hook genérico para:
 * - ejecutar lecturas (query/view) sin wallet
 * - preparar, firmar y enviar transacciones construidas por tus bindings
 */
export function useMidnight(wallet: WalletLike | null) {
  const [isSubmitting, setSubmitting] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);

  /**
   * Enviar una transacción preparada por tu binding.
   * Uso:
   *   submit(() => myFacade.buildIncrementTx({ amount }))
   * donde buildIncrementTx devuelve { tx, privateData? }.
   */
  const submit = useCallback(
    async <Tx, Private>(prepare: () => Promise<PrepareCallResult<Tx, Private>>) => {
      if (!wallet) throw new Error("Wallet no conectado");

      setSubmitting(true);
      setError(null);
      try {
        const { tx, privateData } = await prepare();

        // Elige el método disponible según tu versión del SDK de wallet
        if (typeof wallet.signAndSubmit === "function") {
          const res = await wallet.signAndSubmit(tx, { privateData });
          setLastTxId(res?.txId ?? null);
          return res;
        }
        if (typeof wallet.submit === "function") {
          const res = await wallet.submit(tx, { privateData });
          setLastTxId(res?.txId ?? null);
          return res;
        }
        if (typeof wallet.sign === "function" && typeof wallet.post === "function") {
          const signed = await wallet.sign(tx);
          const res = await wallet.post(signed);
          setLastTxId(res?.txId ?? null);
          return res;
        }

        throw new Error("No encontré un método de envío compatible en el wallet. Verificá la versión de @midnight-ntwrk/wallet.");
      } catch (e) {
        setError(e);
        throw e;
      } finally {
        setSubmitting(false);
      }
    },
    [wallet]
  );

  /** Lecturas "view" que no requieren wallet (pasá acá el query de tu facade). */
  const view = useCallback(async <R>(query: () => Promise<R>) => {
    return query();
  }, []);

  return { submit, view, isSubmitting, lastTxId, error };
}
