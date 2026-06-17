import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      toastOptions={{
        style: {
          background: "#0f0a12",
          border: "1px solid rgba(212,175,55,0.25)",
          color: "#f5f0e8",
          fontFamily: "inherit",
        },
        classNames: {
          title: "text-sm font-semibold tracking-wide",
          description: "text-xs text-muted-foreground",
          success: "!border-emerald-500/30",
          error: "!border-red-500/30",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
