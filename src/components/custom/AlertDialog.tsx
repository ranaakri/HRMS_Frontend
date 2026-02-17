import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props{
  open: boolean;
  message: string;
  onClose: (reslt: boolean) => void;
}

export function AlertDialogBasic ({open,message, onClose}: Props) {

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="bg-black text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>{message}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onClose(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => onClose(true)}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
