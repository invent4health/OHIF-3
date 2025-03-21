import { size } from 'platform/ui/src/components/Button/ButtonEnums';
import React from 'react';

const ContextMenu = ({ commands, onClose }) => {
  const handleButtonClick = buttonId => {
    try {
      const toolbarService = commands?.toolbarService;

      if (!toolbarService) {
        throw new Error('Toolbar service not available');
      }

      const toolbarButtons = toolbarService.state?.buttons;
      if (!toolbarButtons) {
        throw new Error('Toolbar buttons not available');
      }

      const button = toolbarButtons[buttonId];
      if (!button) {
        throw new Error(`Button ${buttonId} not found in toolbar`);
      }

      // Activate the button using recordInteraction
      toolbarService.recordInteraction(buttonId);

      // Close the context menu after successful click
      onClose();

      // console.log(`Activated ${buttonId}:`, button);
    } catch (error) {
      console.error('Context Menu Error:', error.message);
    }
  };

  const availableButtons = commands?.toolbarService?.state?.buttons || {};

  const contextMenuButtons = ['Zoom', 'Pan', 'Magnify', 'Rotate Right', 'Reset View'];

  return (
 <div className="context-menu w-[100px]">
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          width: '150px',
        }}
        className="context-menu"
      >
        {contextMenuButtons.map(buttonId => (
          <li
            key={buttonId}
            style={{
              padding: '5px 10px',
              borderBottom: '1px solid #eee',
            }}
          >
            {availableButtons[buttonId] ? (
              <button
                onClick={() => handleButtonClick(buttonId)}
                title={availableButtons[buttonId].props?.tooltip || buttonId}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: '#FFF',
                  fontSize: '10',
                }}
              >
                {buttonId}
              </button>
            ) : (
              <span
                style={{
                  color: '#888',
                  display: 'block',
                }}
              >
                {buttonId} (N/A)
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContextMenu;
