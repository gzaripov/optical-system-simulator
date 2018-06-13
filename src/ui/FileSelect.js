import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const FileSelectorStyled = styled.div``;

const FileInput = styled.input`
  display: none;
`;

class FileSelector extends Component {
  static propTypes = {
    onSelect: PropTypes.func,
    className: PropTypes.string,
    children: PropTypes.element,
    accept: PropTypes.string,
  };

  static defaultProps = {
    onSelect: () => {},
    className: '',
    children: null,
    accept: '',
  };

  onChange = () => {
    this.props.onSelect(this.input.files);
    this.input.value = '';
  };

  onClick = () => {
    this.input.click();
  };

  render() {
    const { className, children, accept } = this.props;
    const { onClick, onChange } = this;
    return (
      <FileSelectorStyled onClick={onClick} className={className}>
        {children}
        <FileInput
          type="file"
          accept={accept}
          onChange={onChange}
          innerRef={ref => (this.input = ref)}
        />
      </FileSelectorStyled>
    );
  }
}

export default FileSelector;
