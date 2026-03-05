import api from "@/api/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { RouteList } from "@/api/routes";
import { notify } from "./Notification";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useAuth } from "@/context/AuthContext";
import type { TravelingUser } from "./UploadTravelDocuments";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge } from "../ui/badge";
import { useConfirm } from "@/hooks/usecontirm";

export interface DocumentInfo {
  docId: number;
  filePath: string;
  docType: string;
  staus: string;
  uploadedAt: string;
  uploadedBy: UploadedBy;
  locked: boolean;
}

export interface UploadedBy {
  userId: number;
  name: string;
  email: string;
}

function UploadedFiles({
  uploadedDocs,
  setUploadedDocs,
}: {
  readonly uploadedDocs: DocumentInfo[];
  readonly setUploadedDocs: Dispatch<SetStateAction<DocumentInfo[]>>;
}) {
  const options = { timeZone: "Asia/Kolkata" };
  const { user } = useAuth();
  const { confirm, ConfirmComponent } = useConfirm();

  const deleteDoc = useMutation({
    mutationFn: async (docId: number) => {
      return await api.delete(RouteList.uploadTravelingDocs + "/" + docId, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      notify.success("Document deleted succesfully");
    },
    onError: (error: any) => {
      notify.error("Error", error.response.data.message);
      console.error(error.response);
    },
  });

  const handleDeleteDoc = async (docId: number) => {
    const res = await confirm("Are you sure you want to delete document");

    if (!res) return;

    try {
      await deleteDoc.mutateAsync(docId);
      setUploadedDocs(uploadedDocs.filter((res) => res.docId != docId));
    } catch (error: any) {
      console.error(error.response);
      notify.error("Error", error.response.data.message);
    }
  };

  return (
    <div className="mt-4 space-y-2">
      {uploadedDocs.length > 0 &&
        uploadedDocs.map((item, index) => (
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center p-3 rounded-lg border border-gray-100 bg-gray-50/50"
            key={item.docId}
          >
            <a
              href={item.filePath}
              className="text-blue-600 hover:text-blue-800 underline font-medium truncate"
              target="_blank"
            >
              {index + 1}. {item.docType.replace("_", " ")}
            </a>
            <Badge className="w-fit bg-blue-100 text-blue-700 hover:bg-blue-100 border-none shadow-none">
              {item.staus}
            </Badge>
            <div className="text-sm text-gray-500">
              {new Date(item.uploadedAt).toLocaleDateString(undefined, options)}
            </div>
            <div className="flex justify-end">
              {user?.role !== "Manager" && (
                <Button
                  variant="ghost"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8"
                  onClick={() => handleDeleteDoc(item.docId)}
                  disabled={deleteDoc.isPending}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        ))}
      {ConfirmComponent}
    </div>
  );
}

export default function UploadTravelingDocs({
  item,
}: {
  readonly item: TravelingUser;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>();
  const [uploadedDoc, setUploadedDoc] = useState<DocumentInfo[]>([]);
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["uplaodedDocuments", item.travelingUserId],
    queryFn: () =>
      api
        .get<
          DocumentInfo[]
        >(RouteList.uploadedTravelingDocs + "/" + item.travelingUserId, { withCredentials: true })
        .then((res) => res.data),
  });

  useEffect(() => {
    if (data) setUploadedDoc(data);
  }, [data]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select an document");
      return;
    }

    if (!user) {
      notify.error("Logged out", "Please login again");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await api
        .post<
          DocumentInfo[]
        >(RouteList.uploadTravelingDocs + `/${user.userId}/${item.travelingUserId}/${docType}`, formData, { withCredentials: true })
        .then((res) => res.data);
      setUploadedDoc(response);
      // setUploaded([...uploaded, response])
      notify.success("Image uploaded successfully");
    } catch (error: any) {
      notify.error("Error", error.response.data.message);
      console.error("Error in uploading image", error.response);
    }
  };

  return (
    <div className="p-6 rounded-xl bg-white shadow-sm border border-gray-200 m-4">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{item.user.name}</h3>
        <p className="text-sm text-gray-500">{item.user.email}</p>
      </div>

      {user?.role !== "Manager" && (
        <div className="flex flex-col md:flex-row gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
          <Input
            type="file"
            onChange={handleFileChange}
            required
            className="bg-white md:max-w-xs"
          />
          <div className="flex gap-2 flex-1">
            <Select onValueChange={(value) => setDocType(value)} required>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select Document Type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectGroup>
                  <SelectItem value="AADHAAR_CARD">Aadhar card</SelectItem>
                  <SelectItem value="PAN_CARD">Pan card</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              className="bg-black text-white hover:bg-gray-800 px-8"
              onClick={handleFileUpload}
            >
              Upload
            </Button>
          </div>
        </div>
      )}

      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Uploaded Documents
        </h4>
        <UploadedFiles
          uploadedDocs={uploadedDoc}
          setUploadedDocs={setUploadedDoc}
        />
      </div>
    </div>
  );
}
