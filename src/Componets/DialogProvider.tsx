"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type DialogVariant = "info" | "success" | "warning" | "error";

type BaseDialogOptions = {
  title?: string;
  message: ReactNode;
  variant?: DialogVariant;
  confirmText?: string;
  cancelText?: string;
};

type PromptOptions = BaseDialogOptions & {
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
};

type DialogHandlers = {
  alert: (options: BaseDialogOptions) => Promise<void>;
  confirm: (options: BaseDialogOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
};

type DialogMode = "alert" | "confirm" | "prompt";

type DialogRequest =
  | {
      mode: "alert";
      options: Required<BaseDialogOptions>;
      resolve: () => void;
    }
  | {
      mode: "confirm";
      options: Required<BaseDialogOptions>;
      resolve: (value: boolean) => void;
    }
  | {
      mode: "prompt";
      options: Required<BaseDialogOptions> &
        Required<Pick<PromptOptions, "defaultValue" | "placeholder" | "required">>;
      resolve: (value: string | null) => void;
    };

const DialogContext = createContext<DialogHandlers | null>(null);

const VARIANT_STYLES: Record<
  DialogVariant,
  { iconBg: string; icon: string; title: string; button: string }
> = {
  info: {
    iconBg: "bg-blue-100 text-blue-600",
    icon: "ℹ️",
    title: "text-blue-700 dark:text-blue-300",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  success: {
    iconBg: "bg-emerald-100 text-emerald-600",
    icon: "✅",
    title: "text-emerald-700 dark:text-emerald-300",
    button: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  warning: {
    iconBg: "bg-amber-100 text-amber-600",
    icon: "⚠️",
    title: "text-amber-700 dark:text-amber-300",
    button: "bg-amber-600 hover:bg-amber-700 text-white",
  },
  error: {
    iconBg: "bg-rose-100 text-rose-600",
    icon: "❌",
    title: "text-rose-700 dark:text-rose-300",
    button: "bg-rose-600 hover:bg-rose-700 text-white",
  },
};

function DialogRenderer({
  request,
  onConfirm,
  onCancel,
}: {
  request: DialogRequest;
  onConfirm: (value?: string) => void;
  onCancel: () => void;
}) {
  const { mode, options } = request;
  const { message, variant, title, confirmText, cancelText } = options;
  const [inputValue, setInputValue] = useState(
    mode === "prompt" ? options.defaultValue ?? "" : "",
  );
  const [inputError, setInputError] = useState("");

  useEffect(() => {
    setInputValue(mode === "prompt" ? options.defaultValue ?? "" : "");
    setInputError("");
  }, [mode, options]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const styles = VARIANT_STYLES[variant];

  function handlePrimary() {
    if (mode === "prompt") {
      const trimmed = inputValue.trim();
      if (options.required && !trimmed) {
        setInputError("Este campo es obligatorio.");
        return;
      }
      onConfirm(trimmed);
      return;
    }
    onConfirm();
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0f172a] shadow-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5"
      >
        <div className="flex items-start gap-4">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${styles.iconBg}`}
          >
            {styles.icon}
          </span>
          <div className="flex-1 space-y-2">
            {title && (
              <h2 className={`text-lg font-semibold ${styles.title}`}>{title}</h2>
            )}
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {typeof message === "string" ? <p>{message}</p> : message}
            </div>
          </div>
        </div>

        {mode === "prompt" && (
          <div>
            <input
              autoFocus
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0b1120] px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition"
              value={inputValue}
              placeholder={options.placeholder}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (inputError) setInputError("");
              }}
            />
            {inputError && (
              <p className="mt-2 text-xs text-rose-500">{inputError}</p>
            )}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {mode !== "alert" && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={handlePrimary}
            className={`inline-flex justify-center rounded-xl px-4 py-2 text-sm font-semibold transition ${styles.button}`}
            autoFocus={mode !== "prompt"}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<DialogRequest | null>(null);

  const close = useCallback(() => {
    setRequest(null);
  }, []);

  const handlers = useMemo<DialogHandlers>(() => {
    const baseDefaults: Required<BaseDialogOptions> = {
      title: "",
      message: "",
      variant: "info",
      confirmText: "Aceptar",
      cancelText: "Cancelar",
    };

    return {
      alert: (options) =>
        new Promise<void>((resolve) => {
          setRequest({
            mode: "alert",
            options: { ...baseDefaults, ...options },
            resolve,
          });
        }),
      confirm: (options) =>
        new Promise<boolean>((resolve) => {
          const merged = {
            ...baseDefaults,
            variant: options.variant || "warning",
            confirmText: options.confirmText || "Confirmar",
            cancelText: options.cancelText || "Cancelar",
            title: options.title || "Confirmar acción",
            ...options,
          };
          setRequest({
            mode: "confirm",
            options: merged,
            resolve,
          });
        }),
      prompt: (options) =>
        new Promise<string | null>((resolve) => {
          setRequest({
            mode: "prompt",
            options: {
              ...baseDefaults,
              variant: options.variant || "warning",
              confirmText: options.confirmText || "Enviar",
              cancelText: options.cancelText || "Cancelar",
              title: options.title ?? "Ingresa un valor",
              message: options.message,
              defaultValue: options.defaultValue ?? "",
              placeholder: options.placeholder ?? "",
              required: options.required ?? false,
            },
            resolve,
          });
        }),
    };
  }, []);

  const handleConfirm = useCallback(
    (value?: string) => {
      setRequest((current) => {
        if (!current) return null;
        switch (current.mode) {
          case "alert":
            current.resolve();
            break;
          case "confirm":
            current.resolve(true);
            break;
          case "prompt":
            current.resolve(value ?? "");
            break;
        }
        return null;
      });
    },
    [],
  );

  const handleCancel = useCallback(() => {
    setRequest((current) => {
      if (!current) return null;
      if (current.mode === "confirm") {
        current.resolve(false);
      } else if (current.mode === "prompt") {
        current.resolve(null);
      } else {
        current.resolve();
      }
      return null;
    });
  }, []);

  const contextValue = handlers;

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      {request ? (
        <DialogRenderer
          request={request}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      ) : null}
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogHandlers {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useDialog debe usarse dentro de un DialogProvider.");
  }
  return ctx;
}
