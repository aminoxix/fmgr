type HeadType = {
  children: string;
};

const Heading = ({ children }: HeadType) => {
  return <h1 className="text-2xl font-semibold md:text-4xl">{children}</h1>;
};

export default Heading;
