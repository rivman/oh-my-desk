import { BrowserWindow } from 'electron';
import * as actions from 'actions/status';
import * as TYPES from 'actions/actionTypes';
import * as CATEGORY from 'actions/category';

describe('test status action', () => {
  const mockId = 'mock-id';
  const mockMeta = {
    category: CATEGORY.SELF,
  };

  it('should handle openBrowserWindow', () => {
    const mockWindow = JSON.stringify(new BrowserWindow());
    const mockAction = {
      type: TYPES.OPEN_BROWSER_WINDOW,
      payload: {
        id: mockId,
        browserWindow: mockWindow,
      },
      meta: mockMeta,
    };

    expect(actions.openBrowserWindow(mockId, mockWindow))
      .toEqual(mockAction);
  });

  it('should handle closeBrowserWindow', () => {
    const mockAction = {
      type: TYPES.CLOSE_BROWSER_WINDOW,
      payload: {
        id: mockId,
      },
      meta: mockMeta,
    };

    expect(actions.closeBrowserWindow(mockId))
      .toEqual(mockAction);
  });

  it('should handle allocatePreferenceId', () => {
    const mockAction = {
      type: TYPES.ALLOCATE_PREFERENCE_ID,
      payload: {
        id: mockId,
      },
      meta: {
        category: CATEGORY.BROADCAST,
      },
    };

    expect(actions.allocatePreferenceId(mockId))
      .toEqual(mockAction);
  });

  it('should handle openPreference', () => {
    const mockAction = {
      type: TYPES.OPEN_PREFERENCE,
      meta: {
        category: CATEGORY.TARGET,
        containMain: true,
      },
    };

    expect(actions.openPreference(mockId))
      .toEqual(mockAction);
  });

  it('should handle closePreference', () => {
    const mockAction = {
      type: TYPES.CLOSE_PREFERENCE,
      payload: {
        id: 'mock-id',
      },
      meta: mockMeta,
    };

    expect(actions.closePreference('mock-id')).toEqual(mockAction);
  });

  it('should handle setLanguageEnglish', () => {
    const mockAction = {
      type: TYPES.SET_LANGUAGE_ENGLISH,
      meta: {
        category: CATEGORY.BROADCAST,
      },
    };

    expect(actions.setLanguageEnglish()).toEqual(mockAction);
  });

  it('should handle setLanguageKorean', () => {
    const mockAction = {
      type: TYPES.SET_LANGUAGE_KOREAN,
      meta: {
        category: CATEGORY.BROADCAST,
      },
    };

    expect(actions.setLanguageKorean()).toEqual(mockAction);
  });
});