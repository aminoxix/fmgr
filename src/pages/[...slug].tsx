import Heading from "~/components/atoms/text/heading";
import SystemSlug from "~/components/system/slug";
import Layout from "./layout";

const Slug = () => {
  return (
    <Layout>
      <Heading>Dashboard</Heading>
      <SystemSlug />
    </Layout>
  );
};

export default Slug;
