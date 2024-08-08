import Image from "next/image";
import { useEffect, useState } from "react";
import Heading from "~/components/text/heading";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useToast } from "~/components/ui/use-toast";

import { UploadDropzone } from "~/components/buttons/uploadthing";
import Layout from "./layout";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "~/utils/api";

const Upload = () => {
  const { toast } = useToast();

  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const { data: folders } = api.fManager.getAllFolders.useQuery();
  const { mutate: createFile } = api.fManager.createFile.useMutation({
    onSuccess: () => {
      setOpenDialog(false);
      form.reset();
      toast({
        style: {
          backgroundColor: "#111827",
          color: "#fff",
        },
        title: "Created: File",
        description: "File has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error: File",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    folder: z.string().min(1, {
      message: "Folder must be selected.",
    }),
    url: z.string().url({
      message: "URL must be a valid URL.",
    }),
    type: z.string(),
  });

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      url: "",
      type: "",
      name: "",
      folder: "",
    },
  });

  const url = form.watch("url");

  useEffect(() => {
    setOpenDialog(!!url);
  }, [url]);

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    createFile({
      name: values.name,
      folderId: values.folder,
      url: values.url,
      type: values.type,
    });
  }

  return (
    <Layout>
      <Heading>Upload</Heading>
      {true && (
        <Dialog
          open={openDialog}
          onOpenChange={(open) => {
            if (!open) {
              form.setValue("url", "");
            }
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <Form {...form}>
                <form
                  className="grid gap-4"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="text-center">Name</FormLabel>
                        <FormControl className="">
                          <Input
                            placeholder="File name"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.currentTarget.value)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="folder"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="text-center">Folder</FormLabel>
                        <FormControl className="">
                          <Select
                            {...field}
                            onValueChange={(value) =>
                              form.setValue("folder", value)
                            }
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select folder" />
                            </SelectTrigger>
                            <SelectContent>
                              {folders?.map((folder) => (
                                <SelectItem key={folder.id} value={folder.id}>
                                  {folder.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="pt-4">
                    <Button type="submit">Submit</Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {url ? (
        <Image
          width={500}
          height={500}
          src={url}
          loading="lazy"
          alt="Uploaded Image"
          className="rounded-md"
        />
      ) : (
        <div className="flex w-full flex-1 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20">
          <UploadDropzone
            config={{
              mode: "auto",
            }}
            appearance={{
              label: {
                color: "#FDE047",
              },
              button: ({ isUploading }) =>
                `ut-ready:bg-yellow-300 ut-uploading:cursor-not-allowed rounded bg-white/20 bg-none after:bg-yellow-300 ${isUploading ? "text-yellow-300" : "text-black"}`,
              container: () => "mt-4 flex w-full h-full",
              uploadIcon: () => "text-yellow-300",
            }}
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              // Do something with the response
              // alert("Upload Completed");
              form.setValue("type", res[0]?.type ?? "");
              form.setValue("url", res[0]?.url ?? "");
            }}
            onUploadError={(error: Error) => {
              // Do something with the error.
              console.error(`ERROR! ${error.message}`);
              toast({
                title: "Failed to upload file",
                description: `Error uploading file: ${error.message}`,
              });
            }}
          />
        </div>
      )}
    </Layout>
  );
};

export default Upload;
