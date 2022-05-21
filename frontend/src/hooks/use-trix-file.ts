import {uploadImage} from "@/handlers/uploads";
import {useAlerts} from "@hydrophobefireman/kit/alerts";
import {useMount} from "@hydrophobefireman/kit/hooks";

export function useTrixFile() {
  const {persist} = useAlerts();
  useMount(() => {
    const listener = async (event: any) => {
      if (!event.attachment.file) return;
      const {data, error} = await uploadImage(event.attachment.file);
      if (error) {
        return persist({content: error, actionText: "Okay"});
      }
      const u = data.url;

      let href: string | URL = new URL("/_/decrypt", location.href);
      href.searchParams.set("url", u);
      href = href.toString();
      event.attachment.setAttributes({href, url: href});
    };
    window.addEventListener("trix-attachment-add", listener);

    return () => {
      window.removeEventListener("trix-attachment-add", listener);
    };
  });
}
