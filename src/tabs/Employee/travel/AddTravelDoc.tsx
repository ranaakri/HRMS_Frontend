import api from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RouteList } from "@/api/routes";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { notify } from "@/components/custom/Notification";
import { useParams } from "react-router-dom";

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

function UploadedFiles({ uploadedDocs }: { uploadedDocs: DocumentInfo[] }) {
  const options = { timeZone: "Asia/Kolkata" }

  const [docList, setDocList] = useState<DocumentInfo[]>([]);

  useEffect(() => {
    setDocList(uploadedDocs);
  }, [uploadedDocs]);

  const handleDeleteDoc = async (docId: number) => {
    const res = confirm("Are you sure you want to delete document");

    if (!res) return;

    try {
      await api.delete(RouteList.uploadTravelingDocs + "/" + docId, {
        withCredentials: true,
      });
      setDocList(docList.filter((res) => res.docId != docId));
      notify.success("Documnet deleted successfully");
    } catch (error: any) {
      console.error(error.message);
      notify.error("Error", error.message);
    }
  };

  return (
    <div className="">
      {uploadedDocs.length > 0 &&
        uploadedDocs.map((item, index) => (
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-2 items-center m-2"
            key={item.docId}
          >
            <a
              href={item.filePath}
              className="text-blue-500 underline"
              target="_blank"
            >
              {index}. {item.docType}
            </a>
            <Badge className="border text-white">{item.staus}</Badge>
            <div className="">
              {new Date(item.uploadedAt).toLocaleDateString(undefined, options)}
            </div>
            <Button
              variant={"default"}
              className="bg-red-500"
              onClick={() => handleDeleteDoc(item.docId)}
            >
              Remove
            </Button>
          </div>
        ))}
    </div>
  );
}

export default function UploadTravelingDocsEmp() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>();
  const [uploadedDoc, setUploadedDocs] = useState<DocumentInfo[]>([]);
  const { user } = useAuth();
  const {travelId} = useParams();

  const [reload, setReaload] = useState<boolean>(false);

  const { data } = useQuery({
    queryKey: ["uplaodedDocuments", user?.userId],
    queryFn: () =>
      api
        .get<
          DocumentInfo[]
        >(`/travel/documents/user/${user?.userId}/travel/${travelId}`)
        .then((res) => res.data),
  });

  useEffect(() => {
    if (data) setUploadedDocs(data);
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
      notify.error("You are logged out", "Please login");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await api
        .post<
          DocumentInfo[]
        >(RouteList.uploadTravelingDocs + `/employee/${user.userId}/${travelId}/${docType}`, formData, { withCredentials: true })
        .then((res) => res.data);
      setReaload(!reload);
      setUploadedDocs(response);
      // setUploaded([...uploaded, response])
      notify.success("Image uploaded successfully");
    } catch (error: any) {
      notify.error("Error", error.message);
      console.log("Error in uploading image", error);
    }
  };

  return (
    <div className="p-4 rounded-md bg-white shadow-md border-0 m-2">
      <p className="font-semibold text-black mb-2">My Documents</p>
      {!(user?.role === "Manager") && (
        <div className="flex gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="file"
              onChange={handleFileChange}
              required
              className="bg-white"
            />
            <Select onValueChange={(value) => setDocType(value)} required>
              <SelectTrigger className="w-full max-w-48 bg-white">
                <SelectValue placeholder="Select Document Type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectGroup>
                  <SelectItem value="AADHAAR_CARD">Aadhar card</SelectItem>
                  <SelectItem value="PAN_CARD">Pan card</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button
            className="bg-gray-500 text-white cursor-pointer hover:bg-gray-900 duration-200"
            onClick={handleFileUpload}
          >
            Add
          </Button>
        </div>
      )}
      <UploadedFiles uploadedDocs={uploadedDoc} />
    </div>
  );
}