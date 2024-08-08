import System from "~/components/system";
import Heading from "~/components/text/heading";
import Layout from "./layout";

export default function Home() {
  return (
    <Layout>
      <Heading>Dashboard</Heading>
      <System />
    </Layout>
  );
}
