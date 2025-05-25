import React from "react";

export function IconButton(props: {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: string;
  iconSize?: string;
  text?: string;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  aria?: string;
  hideTextOnOverflow?: boolean;
}) {
  // Only use the provided icon if it exists
  const svgSource = props.icon;

  let scaledSvgString = "";
  if (svgSource) {
    let svgString = svgSource.replace(
      /(<svg[^>]*?)fill=".*?"(.*?>)/,
      '$1fill="currentColor"$2',
    );
    svgString = svgString.replace(
      /(<svg[^>]*?)stroke=".*?"(.*?>)/,
      '$1stroke="currentColor"$2',
    );
    scaledSvgString = svgString.replace(/(width|height)="\d*"/g, '$1="100%"');
  }

  return (
    <button
      className={`${props.className}`}
      onClick={props.onClick}
      title={props.title || props.text}
      disabled={props.disabled}
      role="button"
      style={props.style}
      aria-label={props.aria}
    >
      {props.icon && (
        <span
          className="inline-flex shrink-0 items-center justify-center"
          style={{
            width: props.iconSize ? `${props.iconSize}` : "1rem",
            height: props.iconSize ? `${props.iconSize}` : "1rem",
          }}
          dangerouslySetInnerHTML={{ __html: scaledSvgString }}
          aria-hidden="true"
        />
      )}
      {props.text && (
        <div
          aria-label={props.text || props.title}
          className="text-ellipsis whitespace-nowrap pe-1 ps-1 max-[20rem]:hidden"
        >
          {props.text}
        </div>
      )}
    </button>
  );
}
