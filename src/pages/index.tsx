import Heading from "~/components/atoms/text/heading";
import System from "~/components/system";
import Layout from "./layout";

export default function Home() {
  return (
    <Layout>
      <Heading>Dashboard</Heading>
      <System />
    </Layout>
  );
}
