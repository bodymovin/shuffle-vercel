interface InlineSVGInterface {
  content: string
  className?: string
}

function InlineSVG(props: InlineSVGInterface) {
  const { content, className = '' } = props;
  return (
    <div
      style={{ width: '100%', height: '100%' }}
      dangerouslySetInnerHTML={{ __html: content }}
      className={className}
    />
  );
}

InlineSVG.defaultProps = {
  className: '',
};

export default InlineSVG;
