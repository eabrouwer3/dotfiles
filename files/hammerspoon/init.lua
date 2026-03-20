-- F12: Toggle Ghostty dropdown/visor
hs.hotkey.bind({}, "F12", function()
  local app = hs.application.find("Ghostty")
  if app then
    if app:isFrontmost() then
      app:hide()
    else
      app:activate()
    end
  else
    hs.application.launchOrFocus("Ghostty")
  end
end)

-- Window snap: drag to top edge → maximize
local dragWatcher = hs.eventtap.new({hs.eventtap.event.types.leftMouseUp}, function(e)
  local win = hs.window.focusedWindow()
  if not win then return false end
  local mousePos = hs.mouse.absolutePosition()
  local screen = win:screen():frame()
  if mousePos.y <= screen.y + 5 then
    win:maximize()
  end
  return false
end)
dragWatcher:start()

-- Horizontal scroll → switch macOS Spaces
local scrollWatcher = hs.eventtap.new({hs.eventtap.event.types.scrollWheel}, function(e)
  local dx = e:getProperty(hs.eventtap.event.properties.scrollWheelEventDeltaAxis2)
  if dx == 0 then return false end
  if dx > 0 then
    hs.eventtap.keyStroke({"ctrl"}, "right", 0)
  else
    hs.eventtap.keyStroke({"ctrl"}, "left", 0)
  end
  return true
end)
scrollWatcher:start()
