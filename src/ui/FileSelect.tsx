import * as React from "react";
import styled from "styled-components";
import DefaultProps from "../util/DefaultProps";
import { withDefaultProps } from "../util/withDefultProps";

const FileSelectorStyled = styled.div``;

const FileInput = styled.input`
  display: none;
`;

const defaultProps = {
  accept: "",
  children: null,
  className: "",
  onSelect: () => void 0
};

interface Props extends DefaultProps {
  onSelect: (list: FileList | null) => void;
  accept: string;
}

class FileSelector extends React.Component<Props> {
  private input: HTMLInputElement;

  public render() {
    const { className, children, accept } = this.props;
    const { onClick, onChange } = this;
    return (
      <FileSelectorStyled onClick={onClick} className={className}>
        {children}
        <FileInput
          type="file"
          accept={accept}
          onChange={onChange}
          innerRef={this.bindInput}
        />
      </FileSelectorStyled>
    );
  }

  private bindInput = (ref: HTMLInputElement) => {
    this.input = ref;
  };

  private onChange = () => {
    this.props.onSelect(this.input.files);
    this.input.value = "";
  };

  private onClick = () => {
    this.input.click();
  };
}

export default withDefaultProps(defaultProps, FileSelector);
