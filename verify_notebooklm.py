import asyncio
import sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def main():
    server_params = StdioServerParameters(
        command="python",
        args=["-m", "notebooklm_mcp.server"],
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools_result = await session.list_tools()
            tools = tools_result.tools
            print(f"Total Tools: {len(tools)}")
            names = [t.name for t in tools]
            print("Tool Names: " + ", ".join(names))
            
            # Look for a tool that lists notebooks (might be 'notebook_list' or similar)
            list_tool = next((n for n in names if "notebook" in n and "list" in n), None)
            if list_tool:
                print(f"\nAttempting to call: {list_tool}")
                try:
                    result = await session.call_tool(list_tool, arguments={})
                    for item in result.content:
                        if hasattr(item, 'text'):
                            print(item.text)
                        else:
                            print(item)
                except Exception as e:
                    print(f"Error calling {list_tool}: {e}")
            else:
                print("\nNo notebook listing tool found automatically.")

if __name__ == "__main__":
    asyncio.run(main())
